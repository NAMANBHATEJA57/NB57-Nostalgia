"use client";

import { useState } from "react";
import { login } from "./actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Successfully logged in");
      router.push("/admin/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
      <Card className="w-full max-w-sm border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-slate-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
            <LockKeyhole className="w-6 h-6 text-slate-700" />
          </div>
          <CardTitle className="text-2xl font-cormorant font-bold">Admin Portal</CardTitle>
          <CardDescription>Securely access NB57's Nostalgia archive</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="username">Username</label>
              <Input 
                id="username" 
                name="username" 
                type="text" 
                required 
                className="h-12"
                placeholder="NB57"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="h-12"
                placeholder="••••••••"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-blue-600 transition-colors h-12 rounded-xl text-white" 
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
