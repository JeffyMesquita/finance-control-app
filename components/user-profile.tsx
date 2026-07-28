import { useCurrentUser } from "@/hooks/use-current-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

export function UserProfile() {
  const { user, loading, error, refresh } = useCurrentUser();
  const { toast } = useToast();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!user) return null;

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString() : "N?o informado";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{user.user_metadata?.full_name || user.email}</CardTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Membro desde</span>
            <span className="text-sm">
              {formatDate(user.created_at)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Último login</span>
            <span className="text-sm">
              {formatDate(user.last_sign_in_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

