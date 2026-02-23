
"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Filter } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hideEmptyLabels: boolean;
  onToggleHideEmptyLabels: () => void;
}

export function SettingsDialog({ 
  isOpen, 
  onClose, 
  hideEmptyLabels, 
  onToggleHideEmptyLabels 
}: SettingsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] google-shadow border-none rounded-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Settings</DialogTitle>
          </div>
          <DialogDescription>
            Manage your workspace preferences and organization rules.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="flex items-center justify-between space-x-4 bg-secondary/30 p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 shrink-0 bg-background rounded-lg shadow-sm flex items-center justify-center border border-border/20">
                <Filter className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="hide-empty" className="text-sm font-bold cursor-pointer">Hide empty labels</Label>
                <p className="text-xs text-muted-foreground leading-relaxed pr-2">
                  Only show labels in the sidebar that have at least one active note.
                </p>
              </div>
            </div>
            <Switch 
              id="hide-empty" 
              checked={hideEmptyLabels} 
              onCheckedChange={onToggleHideEmptyLabels}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            onClick={onClose}
            className="text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
