import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary caught an error]:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  private handleClearStorage = () => {
    try {
      sessionStorage.clear();
      // Keep auth token if present
      const token = localStorage.getItem("demopick_admin_token");
      const user = localStorage.getItem("demopick_admin_user");
      localStorage.clear();
      if (token) localStorage.setItem("demopick_admin_token", token);
      if (user) localStorage.setItem("demopick_admin_user", user);
    } catch {}
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-xl max-w-lg w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Đã xảy ra sự cố hiển thị</h2>
              <p className="text-sm text-slate-500">
                Hệ thống ghi nhận sự cố giao diện tạm thời. Bạn có thể tải lại trang hoặc quay về trang chủ.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl text-left text-xs font-mono overflow-auto max-h-36">
                <span className="text-rose-400 font-bold">Lỗi: </span>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <Button
                onClick={this.handleReset}
                className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold"
              >
                <RefreshCw className="w-4 h-4" />
                Tải lại trang
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full sm:w-1/2 border-slate-300 text-slate-700 gap-2 font-bold"
              >
                <Home className="w-4 h-4" />
                Về Trang chủ
              </Button>
            </div>

            <button
              type="button"
              onClick={this.handleClearStorage}
              className="text-xs text-slate-400 hover:text-slate-600 underline flex items-center justify-center gap-1 mx-auto mt-2"
            >
              <Trash2 className="w-3 h-3" />
              Làm mới bộ nhớ đệm (Cache)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
