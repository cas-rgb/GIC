"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  minHeight?: string;
}
interface State {
  hasError: boolean;
  errorMsg: string;
}
export default class SafeChartWrapper extends Component<Props, State> {
  public state: State = { hasError: false, errorMsg: "" };
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Chart Render Error:", error, errorInfo);
  }
  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{ minHeight: this.props.minHeight || "250px" }}
          className="flex w-full items-center justify-center bg-slate-50 border border-slate-100 p-4 text-center"
        >
          {" "}
          <div>
            {" "}
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-50" />{" "}
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {this.props.fallbackMessage || "Visualization Unavailable"}
            </p>{" "}
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Data format unsupported by chart render engine.
            </p>{" "}
          </div>{" "}
        </div>
      );
    }
    return this.props.children;
  }
}
