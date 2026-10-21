import React, { useState } from 'react';
import { usePhotobooth } from '@/state/photoboothContext';
import { EventConfig } from '@/types';
import { LocalStorageService } from '@/services/storage/LocalStorageService';
import { Calendar, Plus, Check, Settings, Sparkles, Sliders } from 'lucide-react';

export const EventsView: React.FC = () => {
  const { activeEvent, setActiveEvent, templates } = usePhotobooth();
  const [events, setEvents] = useState<EventConfig[]>(LocalStorageService.getEvents());
  const [editingEvent, setEditingEvent] = useState<EventConfig>(activeEvent);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = () => {
    const list = events.map((e) => (e.id === editingEvent.id ? editingEvent : e));
    if (!list.some((e) => e.id === editingEvent.id)) {
      list.push(editingEvent);
    }
    setEvents(list);
    LocalStorageService.saveEvents(list);
    if (activeEvent.id === editingEvent.id) {
      setActiveEvent(editingEvent);
    }
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  const handleCreateNew = () => {
    const newEvt: EventConfig = {
      ...activeEvent,
      id: `evt-${Date.now().toString(36)}`,
      name: 'New Photobooth Event',
      eventDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingEvent(newEvt);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">Event Management & Capture Settings</h2>
            <p className="text-xs text-muted-foreground">
              Configure event-specific branding, shot sequence rules, and print templates.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors shadow-sm"
          >
            {savedAlert ? <Check className="w-4 h-4 text-emerald-300" /> : <Settings className="w-4 h-4" />}
            <span>{savedAlert ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Event Selection List (4 cols) */}
        <div className="lg:col-span-4 bg-card border border-border rounded-xl p-4 space-y-3">
          <span className="text-xs font-semibold text-muted-foreground block">Registered Events</span>
          <div className="space-y-2">
            {events.map((evt) => {
              const isActive = activeEvent.id === evt.id;
              const isEditing = editingEvent.id === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setEditingEvent(evt)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isEditing
                      ? 'bg-primary/10 border-primary'
                      : 'bg-muted/30 border-border hover:bg-muted/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">{evt.name}</span>
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span>{evt.eventDate}</span>
                    <span>{evt.captureSettings.shotsCount} Shots</span>
                  </div>
                  {!isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEvent(evt);
                      }}
                      className="mt-2 text-[11px] font-semibold text-primary hover:underline"
                    >
                      Set as Live Booth Event
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Event Configuration Form (8 cols) */}
        <div className="lg:col-span-8 bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>General Information & Guest Branding</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={editingEvent.eventDate}
                  onChange={(e) => setEditingEvent({ ...editingEvent, eventDate: e.target.value })}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Guest Screen Welcome Message
                </label>
                <input
                  type="text"
                  value={editingEvent.branding.welcomeMessage || ''}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      branding: { ...editingEvent.branding, welcomeMessage: e.target.value },
                    })
                  }
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Default Print Template
                </label>
                <select
                  value={editingEvent.defaultTemplateId}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, defaultTemplateId: e.target.value })
                  }
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Capture Sequence Rules */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-accent" />
              <span>Capture Timing & Session Rules</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Shots per Session</label>
                <select
                  value={editingEvent.captureSettings.shotsCount}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      captureSettings: {
                        ...editingEvent.captureSettings,
                        shotsCount: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                >
                  <option value={1}>1 Shot</option>
                  <option value={2}>2 Shots</option>
                  <option value={3}>3 Shots (Standard)</option>
                  <option value={4}>4 Shots (Grid)</option>
                  <option value={6}>6 Shots</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Countdown (sec)</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={editingEvent.captureSettings.countdownSec}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      captureSettings: {
                        ...editingEvent.captureSettings,
                        countdownSec: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Interval Between Shots (sec)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={editingEvent.captureSettings.shotIntervalSec}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      captureSettings: {
                        ...editingEvent.captureSettings,
                        shotIntervalSec: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Max Retakes</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={editingEvent.captureSettings.maxRetakes}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      captureSettings: {
                        ...editingEvent.captureSettings,
                        maxRetakes: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingEvent.captureSettings.flashEffect}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      captureSettings: {
                        ...editingEvent.captureSettings,
                        flashEffect: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-border text-primary focus:ring-0"
                />
                <span>Screen Flash Effect</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingEvent.gifSettings.enabled}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      gifSettings: {
                        ...editingEvent.gifSettings,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-border text-primary focus:ring-0"
                />
                <span>Auto-generate Animated GIF</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingEvent.printSettings.autoPrint}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      printSettings: {
                        ...editingEvent.printSettings,
                        autoPrint: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-border text-primary focus:ring-0"
                />
                <span>Auto-Print on Session Complete</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
