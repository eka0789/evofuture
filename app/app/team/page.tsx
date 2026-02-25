export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-muted-foreground mt-2">Manage your team members and permissions</p>
      </div>

      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Team Members</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                  Y
                </div>
                <div>
                  <p className="font-medium">You (Owner)</p>
                  <p className="text-sm text-muted-foreground">Active member</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Joined today
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-12 text-center">
        <p className="text-muted-foreground mb-4">Invite team members to collaborate</p>
        <p className="text-sm text-muted-foreground">Team collaboration features coming soon</p>
      </div>
    </div>
  );
}
