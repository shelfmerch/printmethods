import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Loader2, ImageIcon, CreditCard, ChevronRight, X, Sparkles, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { BackgroundRemoverBanner } from './BackgroundRemoverBanner';


interface AIimageGenProps {
    onImageClick?: (imageUrl: string, assetName?: string) => void;
    selectedPlaceholderId?: string | null;
    onClose?: () => void;
    onBgRemoverClick?: () => void;
}

const STYLES = [
    { value: "illustration", label: "Illustration" },
    { value: "photorealistic", label: "Photorealistic" },
    { value: "3d-render", label: "3D Render" },
    { value: "anime", label: "Anime" },
    { value: "minimalist", label: "Minimalist" },
    { value: "watercolor", label: "Watercolor" },
];

const CREDIT_PACKS = [
    { id: "10_credits", credits: 10, price: 100, originalPrice: 100, discount: 0 },
    { id: "50_credits", credits: 50, price: 450, originalPrice: 500, discount: 10 },
    { id: "150_credits", credits: 150, price: 999, originalPrice: 1500, discount: 33 },
];

export default function AIimageGen({ onImageClick, selectedPlaceholderId, onClose, onBgRemoverClick }: AIimageGenProps) {
    const [prompt, setPrompt] = useState("");
    const [style, setStyle] = useState("illustration");
    const [loading, setLoading] = useState(false);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [stats, setStats] = useState<{ credits: number; history: any[] }>({ credits: 0, history: [] });
    const [showTopup, setShowTopup] = useState(false);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${API_BASE_URL}/ai/me`, {
                headers: {
                    "Authorization": token ? `Bearer ${token}` : ""
                }
            });
            const data = await resp.json();
            if (data.success) {
                setStats({ credits: data.credits, history: data.history });
            }
        } catch (err) {
            console.error("Failed to fetch AI stats:", err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleGenerate = async () => {
        if (!prompt.trim()) return toast.error("Please enter a prompt");
        if (stats.credits < 1) {
            setShowTopup(true);
            return toast.error("Not enough credits. Please top up.");
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${API_BASE_URL}/ai/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : ""
                },
                body: JSON.stringify({ prompt, style })
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || "Generation failed");

            toast.success("Design generated and saved!");
            setStats({ credits: data.credits, history: data.history });
            setPrompt("");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyCredits = async (packageId: string) => {
        setPurchasing(packageId);
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${API_BASE_URL}/ai/topup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : ""
                },
                body: JSON.stringify({ packageId })
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || "Purchase failed");

            toast.success(data.message);
            setStats(prev => ({ ...prev, credits: data.credits }));
            setShowTopup(false);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div className="flex flex-col bg-background h-full overflow-hidden w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold uppercase text-muted-foreground block">IMAGE GENERATOR</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={showTopup} onOpenChange={setShowTopup}>
                        <DialogTrigger asChild>
                            <button className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-full border border-primary/20 hover:bg-primary/20 transition-colors group">
                                <CreditCard className="h-3 w-3 text-primary" />
                                <span className="text-xs font-bold text-primary">{stats.credits}</span>
                                <Plus className="h-3 w-3 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add AI Credits</DialogTitle>
                                <DialogDescription>
                                    Credits are used to generate custom AI designs. 1 Generation = 1 Credit.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {CREDIT_PACKS.map((pkg) => (
                                    <div key={pkg.id} className="flex items-center justify-between p-4 border rounded-xl hover:border-primary transition-all bg-muted/30">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold">{pkg.credits} Credits</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-foreground">₹{pkg.price}</span>
                                                {pkg.discount > 0 && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                                        {pkg.discount}% OFF
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleBuyCredits(pkg.id)}
                                            disabled={!!purchasing}
                                            className="px-6"
                                        >
                                            {purchasing === pkg.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy"}
                                        </Button>
                                    </div>
                                ))}
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3 mt-2">
                                    <Wallet className="h-4 w-4 text-blue-600 mt-0.5" />
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[11px] text-blue-800 leading-tight">
                                            Purchases will be deducted from your <strong>ShelfMerch Wallet</strong>.
                                        </p>
                                        <a href="/wallet" target="_blank" className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5">
                                            Top up wallet <ChevronRight className="h-2 w-2" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                            <X className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Content Container */}
            <div className="p-4 space-y-5 overflow-y-auto">

                {/* Prompt Box */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label className="text-xs font-medium text-foreground">Create your own design</Label>
                        <span className="text-[10px] text-muted-foreground">{prompt.length}/500</span>
                    </div>
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. A cyberpunk tiger with neon accents..."
                        className="min-h-[100px] text-sm resize-none focus-visible:ring-primary"
                        maxLength={500}
                    />
                </div>

                {/* Style Selection */}
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-foreground">Art Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger className="w-full h-10">
                            <SelectValue placeholder="Select Style" />
                        </SelectTrigger>
                        <SelectContent>
                            {STYLES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Generate Button */}
                <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold h-11 transition-all active:scale-[0.98] shadow-sm"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            <span>Generate (1 Credit)</span>
                        </>
                    )}
                </Button>

                <BackgroundRemoverBanner onClick={() => onBgRemoverClick?.()} />

                <div className="flex items-center gap-2 pt-2">
                    <div className="h-[1px] flex-1 bg-border"></div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">History</span>
                    <div className="h-[1px] flex-1 bg-border"></div>
                </div>

                {/* History Grid */}
                <div className="grid grid-cols-2 gap-3 pb-6">
                    {stats.history && stats.history.length > 0 ? (
                        stats.history.map((img, i) => (
                            <div
                                key={i}
                                className="aspect-square rounded-lg overflow-hidden border border-border group relative bg-muted/30 cursor-pointer hover:border-primary transition-all shadow-sm"
                                onClick={() => onImageClick?.(img.url, `AI_${img.prompt.slice(0, 10)}`)}
                            >
                                <img src={img.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
                                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                                    <div className="p-1.5 bg-white rounded-full mb-1 shadow-sm">
                                        <ImageIcon className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-tight text-center">Add to Canvas</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 flex flex-col items-center justify-center py-8 text-muted-foreground/30">
                            <ImageIcon className="h-8 w-8 mb-1 opacity-20" />
                            <p className="text-[10px] font-medium uppercase">No history yet</p>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                {/* <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t mt-4 pb-2">
                    <span className="font-medium italic">Transparent background</span>
                    <ChevronRight className="h-3 w-3 opacity-50" />
                </div> */}
            </div>
        </div>
    );
}
