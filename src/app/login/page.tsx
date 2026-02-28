"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider, 
  User,
  getRedirectResult,
  sendEmailVerification,
  updateProfile,
  signOut
} from 'firebase/auth';
import { Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import bulbImg from '@/app/bulb.webp';

export default function LoginPage() {
  const { user: authUser, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useRedirect, setUseRedirect] = useState(false);

  useEffect(() => {
    if (!auth) return;

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          syncUserProfile(result.user);
          toast({ 
            title: "Welcome Back!", 
            description: `Successfully signed in as ${result.user.email}` 
          });
          router.push('/');
        }
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Redirect Sign-In Failed",
          description: error.message,
        });
      });
  }, [auth, router, toast]);

  useEffect(() => {
    if (!isUserLoading && authUser) {
      const isPasswordUser = authUser.providerData.some(p => p.providerId === 'password');
      if (!isPasswordUser || authUser.emailVerified) {
        router.push('/');
      }
    }
  }, [authUser, isUserLoading, router]);

  const syncUserProfile = (user: User) => {
    if (!db) return;
    const userRef = doc(db, 'users', user.uid);
    setDocumentNonBlocking(userRef, {
      id: user.uid,
      email: user.email,
      displayName: user.displayName || '',
    }, { merge: true });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName });
        await sendEmailVerification(user);
        
        syncUserProfile(user);
        
        toast({
          title: "Verification Email Sent",
          description: `A verification link has been sent to ${email}. Please check your inbox and spam folder to verify your account.`,
        });
        
        await signOut(auth!);
        setIsSignUp(false);
        setEmail('');
        setPassword('');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth!, email, password);
        const user = userCredential.user;
        
        if (!user.emailVerified) {
          await sendEmailVerification(user);
          toast({
            variant: "destructive",
            title: "Email Not Verified",
            description: "A fresh verification link has been sent. Please check your inbox and spam folder before signing in.",
          });
          await signOut(auth!);
          return;
        }
        
        syncUserProfile(user);
        router.push('/');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    setIsLoading(true);
    try {
      if (useRedirect) {
        await signInWithRedirect(auth!, provider);
      } else {
        const result = await signInWithPopup(auth!, provider);
        if (result.user) {
          syncUserProfile(result.user);
          router.push('/');
        }
      }
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "The login popup was interrupted. We've enabled 'Redirect Mode' for you—please try clicking the Google button again.";
        setUseRedirect(true); 
      }

      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <Card className="w-full max-w-md border-none shadow-2xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative h-20 w-20 flex items-center justify-center transform -rotate-6">
              {/* Dark mode glow effect */}
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 dark:opacity-100 transition-opacity duration-700 scale-150" />
              <Image 
                src={bulbImg} 
                alt="Personal Space Logo" 
                width={80} 
                height={80} 
                className="object-contain relative z-10"
                priority
              />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight">Personal Space</CardTitle>
            <CardDescription className="text-base">
              {isSignUp ? "Join our community of thinkers" : "Your thoughts, structured and secure"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              {isSignUp && (
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-base font-medium shadow-md transition-all active:scale-95" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
            </Button>
          </form>

          {!isSignUp && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full h-11 text-base bg-background shadow-sm hover:bg-secondary/50 transition-all active:scale-95" 
                  onClick={handleGoogleSignIn} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.25.81-.59z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      {useRedirect ? "Sign in with Redirect" : "Google"}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2">
                  <input 
                    type="checkbox" 
                    id="redirect-mode" 
                    checked={useRedirect} 
                    onChange={(e) => setUseRedirect(e.target.checked)}
                    className="rounded border-muted text-primary focus:ring-primary"
                  />
                  <label htmlFor="redirect-mode" className="text-xs text-muted-foreground cursor-pointer">
                    Use Redirect Mode (recommended)
                  </label>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            variant="link"
            className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
