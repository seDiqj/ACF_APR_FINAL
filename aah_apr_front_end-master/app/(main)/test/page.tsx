"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParentContext } from "@/contexts/ParentContext";
import StringHelperDfs from "@/helpers/StringHelpers/Dfs";
import { AxiosResponse } from "axios";
import { useRef, useEffect, useState } from "react";

const Test = () => {
  const { requestHandler, reqForToastAndSetMessage } = useParentContext();

  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string>("");

  const stringHelperDfsRef = useRef(new StringHelperDfs());

  const getWordsList = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz".split("");

    for (const char of chars) {
      stringHelperDfsRef.current.learn(char);
    }

    requestHandler()
      .get("/global/getWordsList")
      .then((response: AxiosResponse<any, any>) => {
        for (const word of response.data.data)
          stringHelperDfsRef.current.learn(word);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message)
      );
  };

  const checkValidOrNot = () => {
    if (!input) {
      setMessage("Please enter some word!");
      return;
    }

    const result = stringHelperDfsRef.current.dfs(input);

    if (result) {
      setMessage(`The "${input}" is a valid word!`);
    } else {
      setMessage(`The "${input}" is not a valid word!`);
    }
  };

  useEffect(() => {
    getWordsList();
  }, []);

  const printNumberOfNodes = () => {
    console.log(stringHelperDfsRef.current.getNumberOfNodes());
  };

  const printGraph = () => {
    stringHelperDfsRef.current.printGraph();
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-xl shadow-md flex flex-col gap-4">
      <Label className="font-semibold">
        Enter your word to check if it's valid or not:
      </Label>

      <Input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
        placeholder="Type a word..."
      />

      {message && (
        <span
          className={`text-sm font-medium ${
            message.includes("not") ? "text-red-500" : "text-green-500"
          }`}
        >
          {!input ? input : message}
        </span>
      )}

      <Button
        onClick={checkValidOrNot}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
      >
        Check
      </Button>

      <Button
        onClick={printNumberOfNodes}
        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md"
      >
        Print Number Of Nodes
      </Button>
      <Button
        onClick={printGraph}
        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md"
      >
        Print Graph
      </Button>
    </div>
  );
};

export default Test;
