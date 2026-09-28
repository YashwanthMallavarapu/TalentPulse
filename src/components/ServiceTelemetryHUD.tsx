import React, { useState } from 'react';
import { 
  Activity, 
  ChevronUp, 
  ChevronDown, 
  Radio, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Database, 
  Zap, 
  Layers, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { ServiceCallTelemetry } from '../types';

interface ServiceTelemetryHUDProps {
  telemetryLogs: ServiceCallTelemetry[];
  onClearLogs?: () => void;
}

export const ServiceTelemetryHUD: React.FC<ServiceTelemetryHUDProps> = ({
  telemetryLogs,
  onClearLogs
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const latestLog = telemetryLogs[0];

  const getServiceBadgeColor = (serviceName: string) => {
    switch (serviceName) {
      case 'AUTH-SERVICE': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'JOB-ATS-SERVICE': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'CHALLENGE-SERVICE': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'NOTIFICATION-SERVICE': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MODEL-MONITORING-SERVICE': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'PREPROCESSING-SERVICE': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'KAFKA-BROKER': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 pointer-events-auto">
        {/* Minimized Dock Bar */}
        <div className="bg-gray-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-gray-700 overflow-hidden transition-all duration-300">
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-800/80 select-none"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>

              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 flex-shrink-0">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                Live Service Invocations
              </span>

              {latestLog ? (
                <div className="flex items-center gap-2 text-xs truncate animate-fadeIn">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getServiceBadgeColor(latestLog.serviceName)}`}>
                    {latestLog.serviceName} :{latestLog.servicePort}
                  </span>
                  <span className="font-mono text-cyan-300 font-semibold">{latestLog.method}</span>
                  <span className="font-mono text-gray-300 truncate">{latestLog.endpoint}</span>
                  <span className="text-emerald-400 font-mono font-medium">[{latestLog.statusCode}]</span>
                  <span className="text-gray-400 font-mono text-[11px]">{latestLog.durationMs}ms</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">
                  Ready. Perform an action to see microservices called in real time...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <span className="text-[11px] font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                {telemetryLogs.length} Calls
              </span>
              <button 
                className="p-1 rounded text-gray-400 hover:text-white transition-colors"
                title={isOpen ? 'Collapse Service Monitor' : 'Expand Service Telemetry'}
              >
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expanded Drawer */}
          {isOpen && (
            <div className="border-t border-gray-800 p-4 max-h-72 overflow-y-auto bg-gray-950/90 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-gray-200">
                    Platform Network Activity & Event Stream
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onClearLogs && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearLogs();
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear Logs
                    </button>
                  )}
                </div>
              </div>

              {telemetryLogs.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No service calls recorded yet. Interact with the candidate portal, recruiter dashboard, or admin monitoring to trigger live RPCs.
                </div>
              ) : (
                <div className="space-y-2 font-mono">
                  {telemetryLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-2.5 rounded-lg bg-gray-900 border border-gray-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-[10px] text-gray-500">{log.timestamp}</span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getServiceBadgeColor(log.serviceName)}`}>
                          {log.serviceName} :{log.servicePort}
                        </span>

                        <span className="text-cyan-400 font-bold">{log.method}</span>
                        <span className="text-gray-200 truncate">{log.endpoint}</span>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0 text-[11px]">
                        {log.kafkaEventEmitted && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                            <Radio className="w-2.5 h-2.5" />
                            {log.kafkaEventEmitted}
                          </span>
                        )}

                        <span className="text-emerald-400 font-bold">
                          {log.statusCode} OK
                        </span>

                        <span className="text-gray-400">
                          {log.durationMs}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
