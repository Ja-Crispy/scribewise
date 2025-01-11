import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, FilePlus, History, LogOut, User } from 'lucide-react';

interface Session {
  id: string;
  date: string;
  writingStyle: string;
}

export const SessionHeader = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = React.useState<Session[]>(() => {
    const saved = localStorage.getItem('writing-sessions');
    return saved ? JSON.parse(saved) : [];
  });

  // Save sessions whenever they change
  React.useEffect(() => {
    localStorage.setItem('writing-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const handleNewSession = () => {
    // Save current session before creating new
    const newSession = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      writingStyle: 'formal' // default style
    };
    setSessions(prev => [newSession, ...prev]);
    navigate('/');
  };

  const handleLoadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      navigate('/', { state: { writingStyle: session.writingStyle } });
    }
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  return (
    <header className="border-b dark:border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewSession}
              className="flex items-center gap-2"
            >
              <FilePlus className="h-4 w-4" />
              New Session
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Sessions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[250px]">
                <DropdownMenuLabel>Recent Sessions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sessions.length === 0 ? (
                  <DropdownMenuItem disabled>No recent sessions</DropdownMenuItem>
                ) : (
                  sessions.map((session) => (
                    <DropdownMenuItem
                      key={session.id}
                      onClick={() => handleLoadSession(session.id)}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="text-sm capitalize">{session.writingStyle}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive/90"
                        onClick={(e) => handleDeleteSession(e, session.id)}
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="sr-only">Delete session</span>
                      </Button>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
