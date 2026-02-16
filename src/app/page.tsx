"use client";
import React from "react"; 
import { Button } from "../components/ui/button"; 
import { useTRPC } from "@/trpc/client"; 
import { useMutation, useQuery } from "@tanstack/react-query";



function Page() {
  const trpc = useTRPC();

  const invokeMutation = useMutation(
    trpc.invoke.mutationOptions()
  );

  const { data, isLoading } = useQuery(
    trpc.hello.queryOptions({
      text: "yuvraj",
    })
  );

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <p>{data?.greeting}</p>

      <Button
        onClick={() =>
          invokeMutation.mutate({
            prompt: "yuvraj",
          })
        }
      >
        Click me
      </Button>
    </div>
  );
}

export default Page;