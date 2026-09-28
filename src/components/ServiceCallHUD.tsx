import React, { useState } from 'react';
import { ServiceCallTelemetry } from '../types';
import { 
  Activity, 
  Terminal, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2, 
  Cpu, 
  Radio, 
  X, 
  Trash2, 
  Sparkles,
  Zap
} from 'lucide-react';

interface ServiceCallHUDProps {
  telemetryLogs: ServiceCallTelemetry[];
  onClearLogs: () => void;
}

export const ServiceCallHUD: React.FC<ServiceCallHUDProps> = ({ telemetryLogs, onClearLogs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const latestCall = telemetryLogs.length > 0 ? telemetryLogs[telemetryLogs.length - 1] : null;

  return (
    <>
      {/* Floating Bottom Live Service Activity Bar */}
      <aside 
        aria-label="Live Microservice Dispatch HUD"
        className="fixed bottom-4 right-4 z-40 max-w-md w-full px-2 pointer-events-auto"
      >
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl text-white transition-all">
          <div className="flex items-center justify-between gap-3">
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 text-left flex-1 min-w-0"
            >
              <div className="h-8 w-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                <Radio className="h-4 w-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 font-mono">
                    Live Service Call HUD
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {telemetryLogs.length} calls
                  </span>
                </div>
                
                {latestCall ? (
                  <p className="text-xs text-slate-200 truncate font-mono">
                    <strong className="text-amber-400">[{latestCall.serviceName}]</strong> {latestCall.method} {latestCall.endpoint} ({latestCall.durationMs}ms)
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 truncate font-mono">
                    Awaiting user interaction to dispatch service calls...
                  </p>
                )}
              </div>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition"
                title={isOpen ? 'Collapse Service Traces' : 'Expand Service Traces'}
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>

          </div>

          {/* Expanded Drawer */}
          {isOpen && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
                <span className="font-bold flex items-center gap-1">
                  <Terminal className="h-3.5 w-3.5 text-orange-400" />
                  Real-time Microservice Traces:
                </span>
                <button
                  onClick={onClearLogs}
                  className="hover:text-rose-400 transition flex items-center gap-1 text-[10px]"
                >
                  <Trash2 className="h-3 w-3" /> Clear Traces
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 font-mono text-[10px]">
                {telemetryLogs.length === 0 ? (
                  <div className="text-center py-4 text-slate-500">
                    No service calls logged yet. Perform a login, submit a resume, or trigger a quiz to see live service traces.
                  </div>
                ) : (
                  [...telemetryLogs].reverse().map(log => (
                    <div 
                      key={log.id} 
                      className="p-2 rounded-xl bg-slate-850 border border-slate-800 space-y-1 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                            {log.serviceName} :{log.servicePort}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded font-bold ${
                            log.method === 'POST' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {log.method}
                          </span>
                          <span className="text-slate-300 truncate max-w-[140px]">
                            {log.endpoint}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-emerald-400 font-bold">{log.statusCode}</span>
                          <span className="text-slate-500">{log.durationMs}ms</span>
                        </div>
                      </div>

                      <div className="text-slate-400 text-[10px] pl-1 border-l-2 border-slate-700">
                        {log.summary}
                      </div>

                      {log.kafkaEventEmitted && (
                        <div className="text-amber-400 text-[9px] flex items-center gap-1">
                          <Zap className="h-2.5 w-2.5" />
                          Kafka Topic: <strong>{log.kafkaEventEmitted}</strong>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </aside>
    </>
  );
};
