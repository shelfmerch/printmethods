import React from 'react';
import { Button } from "@/components/ui/button";
import { Eraser, MousePointerClick, X } from "lucide-react";

interface BackgroundRemoverPanelProps {
    onClose?: () => void;
}

export default function BackgroundRemoverPanel({ onClose }: BackgroundRemoverPanelProps) {
    return (
        <div className="flex flex-col bg-background h-full overflow-hidden w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold uppercase text-muted-foreground block">BG REMOVER</h2>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Content Container */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <MousePointerClick className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-lg font-bold text-foreground">Remove Background</h3>
                
                <div className="space-y-4 text-sm text-muted-foreground max-w-[250px] mt-4">
                    <p className="flex items-start gap-3 text-left">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center font-bold text-foreground text-xs">1</span>
                        <span>Click any image on the canvas to select it.</span>
                    </p>
                    <p className="flex items-start gap-3 text-left">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center font-bold text-foreground text-xs">2</span>
                        <span>The background will be automatically removed.</span>
                    </p>
                </div>

                <div className="mt-8 p-4 bg-muted/50 rounded-xl w-full">
                    <p className="text-[11px] text-muted-foreground font-medium">
                        Works best on images with clear subjects like AI generated art or photos.
                    </p>
                </div>
            </div>
        </div>
    );
}
