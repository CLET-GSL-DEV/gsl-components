import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rfdtech/components";

export function TabsExample() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Manage your profile details and contact information.
      </TabsContent>
      <TabsContent value="security">
        Update your password and two-factor authentication settings.
      </TabsContent>
      <TabsContent value="notifications">
        Choose which email and in-app alerts you receive.
      </TabsContent>
    </Tabs>
  );
}
