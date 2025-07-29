import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWebSocket, WebSocketMessage } from "@/hooks/use-websocket";
import { Users, Wifi, WifiOff, UserPlus, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";

interface WorkshopCollaborationProps {
  onResponseUpdate: (elementId: string, value: number) => void;
  onEvaluationUpdate: (data: any) => void;
  currentResponses: Record<string, number>;
  evaluationData: any;
}

interface Participant {
  name: string;
  isActive: boolean;
  currentElement?: string;
}

export default function WorkshopCollaboration({
  onResponseUpdate,
  onEvaluationUpdate,
  currentResponses,
  evaluationData
}: WorkshopCollaborationProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [workshopId, setWorkshopId] = useState('');
  const [userName, setUserName] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [participantCursors, setParticipantCursors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'workshop_joined':
        setIsJoined(true);
        setParticipants(message.participants.map((name: string) => ({ 
          name, 
          isActive: true 
        })));
        toast({
          title: t('workshopJoined'),
          description: `${t('workshopId')}: ${message.workshopId}`,
        });
        break;

      case 'participant_joined':
        setParticipants(prev => [...prev, { 
          name: message.userName, 
          isActive: true 
        }]);
        addRecentUpdate({
          type: 'participant_joined',
          userName: message.userName,
          timestamp: message.timestamp
        });
        break;

      case 'participant_left':
        setParticipants(prev => prev.filter(p => p.name !== message.userName));
        addRecentUpdate({
          type: 'participant_left',
          userName: message.userName,
          timestamp: message.timestamp
        });
        break;

      case 'response_updated':
        onResponseUpdate(message.elementId, message.value);
        addRecentUpdate({
          type: 'response_updated',
          userName: message.userName,
          elementId: message.elementId,
          value: message.value,
          timestamp: message.timestamp
        });
        break;

      case 'evaluation_updated':
        onEvaluationUpdate(message.evaluationData);
        addRecentUpdate({
          type: 'evaluation_updated',
          userName: message.userName,
          timestamp: message.timestamp
        });
        break;

      case 'participant_cursor':
        setParticipantCursors(prev => ({
          ...prev,
          [message.userName]: message.elementId
        }));
        
        // Remove cursor after a delay
        setTimeout(() => {
          setParticipantCursors(prev => {
            const updated = { ...prev };
            delete updated[message.userName];
            return updated;
          });
        }, 5000);
        break;
    }
  }, [onResponseUpdate, onEvaluationUpdate, toast]);

  const { isConnected, isConnecting, connect, disconnect, sendMessage } = useWebSocket({
    onMessage: handleMessage,
    onConnect: () => {
      console.log('WebSocket connected');
    },
    onDisconnect: () => {
      setIsJoined(false);
      setParticipants([]);
      console.log('WebSocket disconnected');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: t('connectionError'),
        description: t('websocketConnectionFailed'),
        variant: "destructive",
      });
    }
  });

  const addRecentUpdate = (update: any) => {
    setRecentUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
  };

  const handleJoinWorkshop = () => {
    if (!workshopId.trim() || !userName.trim()) {
      toast({
        title: t('error'),
        description: t('fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    if (!isConnected) {
      connect();
    }

    sendMessage({
      type: 'join_workshop',
      workshopId: workshopId.trim(),
      userName: userName.trim()
    });
  };

  const handleLeaveWorkshop = () => {
    sendMessage({
      type: 'leave_workshop'
    });
    setIsJoined(false);
    setParticipants([]);
    setRecentUpdates([]);
    setParticipantCursors({});
  };

  const broadcastResponseUpdate = (elementId: string, value: number) => {
    if (isJoined && isConnected) {
      sendMessage({
        type: 'response_update',
        elementId,
        value
      });
    }
  };

  const broadcastEvaluationUpdate = (data: any) => {
    if (isJoined && isConnected) {
      sendMessage({
        type: 'evaluation_update',
        evaluationData: data
      });
    }
  };

  const broadcastCursor = (elementId: string, action: 'focus' | 'blur' | 'hover') => {
    if (isJoined && isConnected) {
      sendMessage({
        type: 'participant_cursor',
        elementId,
        action
      });
    }
  };

  // Expose functions for parent components
  useEffect(() => {
    (window as any).workshopCollaboration = {
      broadcastResponseUpdate,
      broadcastEvaluationUpdate,
      broadcastCursor,
      getParticipantCursors: () => participantCursors
    };
  }, [broadcastResponseUpdate, broadcastEvaluationUpdate, broadcastCursor, participantCursors]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-blue-900">{t('collaborativeWorkshop')}</span>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Wifi className="h-3 w-3 mr-1" />
                {t('connected')}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <WifiOff className="h-3 w-3 mr-1" />
                {t('disconnected')}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isJoined ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {t('workshopId')}
                </label>
                <Input
                  placeholder={t('enterWorkshopId')}
                  value={workshopId}
                  onChange={(e) => setWorkshopId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {t('yourName')}
                </label>
                <Input
                  placeholder={t('enterYourName')}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={handleJoinWorkshop}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isConnecting ? t('connecting') : t('joinWorkshop')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{t('workshop')}: {workshopId}</h3>
                <p className="text-sm text-gray-600">{t('participants')}: {participants.length}</p>
              </div>
              <Button 
                onClick={handleLeaveWorkshop}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {t('leaveWorkshop')}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Participants Panel */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {t('activeParticipants')}
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{participant.name}</span>
                      {participantCursors[participant.name] && (
                        <Badge variant="secondary" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          {t('viewing')}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <p className="text-xs text-gray-500">{t('noOtherParticipants')}</p>
                  )}
                </div>
              </div>

              {/* Recent Updates Panel */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">{t('recentUpdates')}</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {recentUpdates.map((update, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      <span className="font-medium">{update.userName}</span>
                      {update.type === 'response_updated' && (
                        <span> {t('updated')} {update.elementId}</span>
                      )}
                      {update.type === 'participant_joined' && (
                        <span className="text-green-600"> {t('joined')}</span>
                      )}
                      {update.type === 'participant_left' && (
                        <span className="text-red-600"> {t('left')}</span>
                      )}
                      {update.type === 'evaluation_updated' && (
                        <span> {t('savedEvaluation')}</span>
                      )}
                      <span className="text-gray-400 ml-1">
                        {formatTimestamp(update.timestamp)}
                      </span>
                    </div>
                  ))}
                  {recentUpdates.length === 0 && (
                    <p className="text-xs text-gray-500">{t('noRecentUpdates')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}