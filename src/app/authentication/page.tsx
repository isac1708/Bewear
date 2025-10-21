
"use client";


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Header from "./components/common/header";
import SignInForm from "./components/sign-in-form";
import SignUpForm from "./components/sign-up-form";

const Authentication = () => {
  return (
    <>
      <Header />

      <div className="flex w-full flex-col gap-6 p-5 ">
        <Tabs defaultValue="sign-in">
          <TabsList>
            <TabsTrigger value="sign-in">Entrar</TabsTrigger>
            <TabsTrigger value="sign-up">Criar conta</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in" className="w-full">
            <SignInForm />
          </TabsContent>
          <TabsContent value="sign-up" className="w-full">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
export default Authentication;


//https://www.better-auth.com/docs/authentication/google doc para implementar login com google
//no .env colocar as variaveis GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET  link para a cloud console https://console.cloud.google.com
//colocar tb no .env BETTER_AUTH_SECRET com uma string aleatoria para o secret do better auth
//colocar no .env DATABASE_URL a url do banco de dados postgresql neste projeto estou usando o neon.tech