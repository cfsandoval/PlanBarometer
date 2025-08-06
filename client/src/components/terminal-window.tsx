import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, X, Minus, Square } from "lucide-react";

interface TerminalEntry {
  id: string;
  timestamp: string;
  command: string;
  output: string;
  status: 'running' | 'success' | 'error';
}

interface TerminalWindowProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TerminalEntry[];
}

export default function TerminalWindow({ isOpen, onClose, entries }: TerminalWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[90vw]">
      <Card className="bg-gray-900 text-green-400 border-gray-700 shadow-2xl">
        <CardHeader className="pb-2 bg-gray-800 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-green-400" />
              <CardTitle className="text-sm text-green-400">Terminal TOPP</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-700"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minus className="h-3 w-3 text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-700"
                onClick={onClose}
              >
                <X className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0">
            <ScrollArea className="h-64" ref={scrollRef}>
              <div className="p-3 space-y-2 font-mono text-xs">
                {entries.map((entry) => (
                  <div key={entry.id} className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="text-blue-400">[{entry.timestamp}]</span>
                      <span className="text-yellow-400">$</span>
                      <span className="text-white">{entry.command}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        entry.status === 'running' ? 'bg-yellow-400 animate-pulse' :
                        entry.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                    </div>
                    <div className={`pl-4 text-xs ${
                      entry.status === 'error' ? 'text-red-400' : 'text-green-300'
                    }`}>
                      {entry.output.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {entries.length === 0 && (
                  <div className="text-gray-500 text-center py-8">
                    Terminal listo para comandos TOPP...
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </div>
  );
}