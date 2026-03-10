import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("BloodLink Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#111114", padding:"20px" }}>
          <div style={{ textAlign:"center", maxWidth:"480px" }}>
            <div style={{ fontSize:"60px", marginBottom:"20px" }}>🩸</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"24px", fontWeight:800, color:"#F5F5F7", marginBottom:"12px" }}>
              Something went wrong
            </h2>
            <p style={{ color:"#8E8E9A", fontSize:"14px", marginBottom:"24px", lineHeight:1.6 }}>
              An unexpected error occurred. Please refresh the page to continue.
            </p>
            <div style={{ background:"#18181C", border:"1px solid #2A2A30", borderRadius:"10px", padding:"12px 16px", marginBottom:"24px", textAlign:"left" }}>
              <p style={{ fontSize:"12px", color:"#FF4D5E", fontFamily:"monospace", wordBreak:"break-word" }}>
                {this.state.error?.message || "Unknown error"}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{ padding:"12px 28px", background:"#E8192C", color:"#fff", border:"none", borderRadius:"10px", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"15px", cursor:"pointer" }}
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}