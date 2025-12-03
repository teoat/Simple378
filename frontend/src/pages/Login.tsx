import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export function Login() {
  return (
    <div className="flex min-h-screen flex-1">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white dark:bg-slate-950">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-slate-900 dark:text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Access the AntiGravity Fraud Detection System
            </p>
          </div>

          <div className="mt-10">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-slate-900">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 mix-blend-overlay" />
           <div className="flex h-full items-center justify-center p-12">
             <div className="max-w-2xl text-center">
               <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                 Advanced Fraud Detection
               </h1>
               <p className="mt-6 text-lg leading-8 text-slate-300">
                 Leverage AI-powered analysis to detect structuring, rapid movement, and entity links in real-time.
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
