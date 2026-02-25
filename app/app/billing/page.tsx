export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-2">Manage your subscription and payment methods</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="text-2xl font-bold">Free Trial</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-lg font-semibold">$0/month</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-sm font-medium text-green-600">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Usage</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-lg font-semibold">1 / 5</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Storage</p>
              <p className="text-lg font-semibold">0.5 GB / 10 GB</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">API Calls</p>
              <p className="text-lg font-semibold">234 / 10,000</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-12 text-center">
        <p className="text-muted-foreground mb-4">Ready to upgrade?</p>
        <p className="text-sm text-muted-foreground">Payment integration coming soon</p>
      </div>
    </div>
  );
}
