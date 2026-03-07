import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useLoginMutation } from "../../features/auth/authApi";
import { setCredentials } from "../../features/auth/authSlice";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const ROLE_HOME = {
  main_admin: "/admin",
  hospital_admin: "/hospital",
  donor: "/donor",
  receiver: "/receiver",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [form, setForm] = useState({
    email: "",
    password: "",
    loginAs: "user",
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email required";
    if (!form.password) e.password = "Password required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const data = await login(form).unwrap();
      dispatch(
        setCredentials({ user: data.user, accessToken: data.accessToken }),
      );
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(ROLE_HOME[data.user.role] || "/");
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111114",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* bg glow */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          left: "-200px",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(232,25,44,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: "420px" }} className="fade-up">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span
            className="heartbeat"
            style={{ fontSize: "52px", display: "block", marginBottom: "12px" }}
          >
            🩸
          </span>
          <h1
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: "28px",
              fontWeight: 800,
              color: "#F5F5F7",
            }}
          >
            Blood<span style={{ color: "#E8192C" }}>Link</span>
          </h1>
          <p style={{ color: "#8E8E9A", fontSize: "14px", marginTop: "6px" }}>
            Sign in to your account
          </p>
        </div>

        <Card>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              icon="✉"
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
              icon="🔒"
              error={errors.password}
            />
            <Input
              label="Login as"
              type="select"
              value={form.loginAs}
              onChange={(e) => set("loginAs", e.target.value)}
              options={[
                { value: "user", label: "👤 Donor / Patient" },
                { value: "hospital", label: "🏥 Hospital Admin" },
              ]}
            />
            <Button
              type="submit"
              full
              loading={isLoading}
              style={{ marginTop: "4px" }}
            >
              Sign In →
            </Button>
          </form>

          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              background: "#1F1F24",
              borderRadius: "10px",
              border: "1px solid #2A2A30",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "#8E8E9A",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Demo Credentials
            </p>

            {[
              {
                label: "Main Admin",
                email: "admin@bloodlink.in",
                pwd: "Admin@123",
                as: "user",
              },
              {
                label: "Hospital Admin",
                email: "apollo@bloodlink.in",
                pwd: "Hospital@123",
                as: "hospital",
              },
              {
                label: "Donor",
                email: "rahul@bloodlink.in",
                pwd: "User@123",
                as: "user",
              },
              {
                label: "Patient",
                email: "priya@bloodlink.in",
                pwd: "User@123",
                as: "user",
              },
            ].map((d) => (
              <button
                key={d.email}
                onClick={() =>
                  setForm({ email: d.email, password: d.pwd, loginAs: d.as })
                }
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "5px 8px",
                  background: "none",
                  border: "none",
                  color: "#8E8E9A",
                  fontSize: "12px",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#2A2A30")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <span style={{ color: "#FF4D5E", fontWeight: 700 }}>
                  {d.label}:
                </span>{" "}
                {d.email}
              </button>
            ))}
          </div>
        </Card>

        <p
          style={{
            textAlign: "center",
            color: "#8E8E9A",
            fontSize: "13px",
            marginTop: "20px",
          }}
        >
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#E8192C", fontWeight: 600 }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
