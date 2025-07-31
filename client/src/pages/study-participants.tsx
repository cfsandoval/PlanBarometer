import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Users, UserPlus, Mail, Trash2, User, UserCheck } from "lucide-react";

interface StudyParticipant {
  id: number;
  studyId: number;
  userId: number;
  status: string;
  role: string;
  expertise?: string;
  invitedAt: string;
  joinedAt?: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface DelphiStudy {
  id: number;
  title: string;
  description: string;
  groupId: number;
  group: {
    id: number;
    name: string;
  };
}

export default function StudyParticipants() {
  const { studyId } = useParams<{ studyId: string }>();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("participant");
  const [inviteExpertise, setInviteExpertise] = useState("");

  // Fetch study details
  const { data: study, isLoading: studyLoading } = useQuery({
    queryKey: [`/api/delphi/studies/${studyId}`],
    queryFn: async () => {
      const response = await fetch(`/api/delphi/studies/${studyId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      return response.json() as Promise<DelphiStudy>;
    },
  });

  // Fetch study participants
  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: [`/api/delphi/studies/${studyId}/participants`],
    queryFn: async () => {
      const response = await fetch(`/api/delphi/studies/${studyId}/participants`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      return response.json() as Promise<StudyParticipant[]>;
    },
  });

  // Invite participant mutation
  const inviteParticipantMutation = useMutation({
    mutationFn: async (data: { email: string; role: string; expertise?: string }) => {
      const response = await fetch(`/api/delphi/studies/${studyId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Participante invitado",
        description: "El experto ha sido invitado al estudio exitosamente",
      });
      setInviteEmail("");
      setInviteRole("participant");
      setInviteExpertise("");
      queryClient.invalidateQueries({ queryKey: [`/api/delphi/studies/${studyId}/participants`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al invitar participante",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove participant mutation
  const removeParticipantMutation = useMutation({
    mutationFn: async (participantId: number) => {
      const response = await fetch(`/api/delphi/studies/${studyId}/participants/${participantId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }
    },
    onSuccess: () => {
      toast({
        title: "Participante removido",
        description: "El participante ha sido removido del estudio",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/delphi/studies/${studyId}/participants`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al remover participante",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInviteParticipant = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email requerido",
        description: "Por favor ingresa el email del participante",
        variant: "destructive",
      });
      return;
    }

    inviteParticipantMutation.mutate({
      email: inviteEmail,
      role: inviteRole,
      expertise: inviteExpertise || undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'invited': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'withdrawn': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'expert': return <UserCheck className="h-4 w-4" />;
      case 'observer': return <User className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  if (studyLoading || participantsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Participantes del Estudio
            </h1>
            <p className="text-gray-600 mt-1">
              {study?.title} - Grupo: {study?.group.name}
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Users className="h-4 w-4 mr-1" />
            {participants.length} participantes
          </Badge>
        </div>

        {/* Invite Participant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Invitar Experto al Estudio
            </CardTitle>
            <CardDescription>
              Agrega expertos específicos para este estudio Delphi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email del Experto</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="experto@ejemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol en el Estudio</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participant">Participante</SelectItem>
                    <SelectItem value="expert">Experto</SelectItem>
                    <SelectItem value="observer">Observador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expertise">Área de Expertise (Opcional)</Label>
              <Textarea
                id="expertise"
                placeholder="Describe el área de expertise del participante..."
                value={inviteExpertise}
                onChange={(e) => setInviteExpertise(e.target.value)}
                rows={2}
              />
            </div>
            <Button 
              onClick={handleInviteParticipant}
              disabled={inviteParticipantMutation.isPending}
              className="w-full md:w-auto"
            >
              <Mail className="h-4 w-4 mr-2" />
              {inviteParticipantMutation.isPending ? "Invitando..." : "Enviar Invitación"}
            </Button>
          </CardContent>
        </Card>

        {/* Participants List */}
        <Card>
          <CardHeader>
            <CardTitle>Participantes Actuales</CardTitle>
            <CardDescription>
              Lista de todos los expertos participando en este estudio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay participantes en este estudio aún.</p>
                <p className="text-sm">Invita expertos usando el formulario de arriba.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {getRoleIcon(participant.role)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">
                            {participant.user.firstName && participant.user.lastName
                              ? `${participant.user.firstName} ${participant.user.lastName}`
                              : participant.user.username}
                          </h3>
                          <Badge className={getStatusColor(participant.status)}>
                            {participant.status}
                          </Badge>
                          <Badge variant="outline">
                            {participant.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{participant.user.email}</p>
                        {participant.expertise && (
                          <p className="text-sm text-gray-500 mt-1">
                            Expertise: {participant.expertise}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-500">
                        {participant.joinedAt 
                          ? `Unido: ${new Date(participant.joinedAt).toLocaleDateString()}`
                          : `Invitado: ${new Date(participant.invitedAt).toLocaleDateString()}`
                        }
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeParticipantMutation.mutate(participant.id)}
                        disabled={removeParticipantMutation.isPending}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}