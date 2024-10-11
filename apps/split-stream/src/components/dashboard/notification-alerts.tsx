import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";

const notifications = [
  { id: 1, type: "pending", message: "You owe $50 to Alice for groceries", date: "2023-04-10" },
  { id: 2, type: "alert", message: "Overdue payment: $30 to Bob for movie tickets", date: "2023-04-08" },
  { id: 3, type: "success", message: "Charlie settled the electricity bill", date: "2023-04-07" },
  { id: 4, type: "pending", message: "New expense added: $60 for dinner with David", date: "2023-04-06" },
  { id: 5, type: "alert", message: "Unusual activity detected in your account", date: "2023-04-05" },
];

export default function NotificationsAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icons.bell className="h-6 w-6" />
          <span>Notifications and Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li key={notification.id} className="flex items-start space-x-4 p-4 bg-secondary rounded-lg">
              {notification.type === "pending" && <Icons.bell className="h-6 w-6 text-blue-500" />}
              {notification.type === "alert" && <Icons.alert className="h-6 w-6 text-red-500" />}
              {notification.type === "success" && <Icons.checkCircle className="h-6 w-6 text-green-500" />}
              <div className="flex-1">
                <p className="font-medium">{notification.message}</p>
                <p className="text-sm text-muted-foreground">{notification.date}</p>
              </div>
              <Badge variant={notification.type === "alert" ? "destructive" : "secondary"}>
                {notification.type}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}