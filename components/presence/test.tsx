import React from "react";

import { CodeIcon, RatIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function VSCodeInfoCard() {
  return (
    <Card className="w-72 bg-black bg-opacity-40 backdrop-filter backdrop-blur-lg border border-gray-800 hover:border-gray-700 transition-all duration-300">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-white mb-3">
          Visual Studio Code
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 group">
            <RatIcon className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors duration-200" />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-200">
              Editing PresenceActivity.tsx
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 group">
              <CodeIcon className="h-5 w-5 text-green-400 group-hover:text-green-300 transition-colors duration-200" />
              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                Workspace:
              </span>
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-200">
              imjustlucas.dev
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
