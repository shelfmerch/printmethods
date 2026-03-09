const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/ai/generate
 * @desc    Generate image using AI and save to history
 * @access  Private
 */
router.post('/generate', protect, async (req, res) => {
    const { prompt, style } = req.body;
    const userId = req.user._id;

    if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    try {
        // 1. Check & Deduct Credits in MongoDB
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        if (user.credits < 1) {
            return res.status(402).json({ success: false, error: "Insufficient credits" });
        }

        // 2. Request AI Generation (Calling Supabase Edge Function)
        // Using environment variables for Supabase URL and API Key
        const supabaseUrl = process.env.SUPABASE_URL || "https://gbdeormjdauyevrnjfxf.supabase.co";
        const apiKey = process.env.DREAM_CANVAS_API_KEY;

        if (!apiKey) {
            console.error("DREAM_CANVAS_API_KEY is not configured");
            return res.status(500).json({ success: false, error: "Server configuration error" });
        }

        const supabaseResp = await axios.post(
            `${supabaseUrl}/functions/v1/generate-image`,
            {
                prompt,
                style: style || 'illustration',
                width: 1024,
                height: 1024,
                source: 'shelfmerch_ai_panel',
                api_key: apiKey
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const generatedUrl = supabaseResp.data.image_url;

        if (!generatedUrl) {
            throw new Error("No image URL returned from generator");
        }

        // 3. Save to MongoDB
        user.credits -= 1;
        user.generatedImages.unshift({
            url: generatedUrl,
            prompt,
            style: style || 'illustration'
        });

        // Keep only last 20 images in history to avoid document bloat
        if (user.generatedImages.length > 20) {
            user.generatedImages = user.generatedImages.slice(0, 20);
        }

        await user.save();

        res.json({
            success: true,
            image_url: generatedUrl,
            credits: user.credits,
            history: user.generatedImages.slice(0, 6) // Return 6 most recent for UI
        });

    } catch (error) {
        console.error("AI Generation Error:", error.response?.data || error.message);
        const errorMsg = error.response?.data?.error || error.message || "Failed to generate image";
        res.status(500).json({ success: false, error: errorMsg });
    }
});

/**
 * @route   GET /api/ai/me
 * @desc    Get user's AI stats and history
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('credits generatedImages');
        res.json({
            success: true,
            credits: user.credits,
            history: user.generatedImages.slice(0, 10)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch AI stats" });
    }
});

const walletService = require('../services/walletService');

/**
 * @route   POST /api/ai/topup
 * @desc    Buy AI credits using wallet balance
 * @access  Private
 */
router.post('/topup', protect, async (req, res) => {
    const { packageId } = req.body;
    const userId = req.user._id;

    const PACKAGES = {
        "10_credits": { credits: 10, pricePaise: 10000 },   // ₹100
        "50_credits": { credits: 50, pricePaise: 45000 },   // ₹450
        "150_credits": { credits: 150, pricePaise: 99900 }  // ₹999
    };

    const pkg = PACKAGES[packageId];
    if (!pkg) {
        return res.status(400).json({ success: false, error: "Invalid package" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Check Wallet Balance
        const balance = await walletService.getBalance(userId);
        if (balance.balancePaise < pkg.pricePaise) {
            return res.status(400).json({ success: false, error: "Insufficient wallet balance. Please top up your wallet first." });
        }

        // 2. Debit Wallet
        const transId = `ai_buy_${userId}_${Date.now()}`;
        await walletService.debitWallet(userId, pkg.pricePaise, {
            type: 'PURCHASE',
            source: 'SYSTEM',
            referenceType: 'AI_CREDITS',
            referenceId: transId,
            idempotencyKey: transId,
            description: `Purchased ${pkg.credits} AI Image Generation credits`,
            meta: { packageId, credits: pkg.credits }
        }, session);

        // 3. Add Credits to User
        const user = await User.findById(userId).session(session);
        user.credits = (user.credits || 0) + pkg.credits;
        await user.save();

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            credits: user.credits,
            message: `Successfully added ${pkg.credits} credits!`
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Credit Purchase Error:", error);
        res.status(500).json({ success: false, error: "Failed to process purchase" });
    }
});

module.exports = router;
