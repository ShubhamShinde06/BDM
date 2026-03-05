import { useState } from "react";
import toast from "react-hot-toast";
import { useGetAdminUsersQuery, useToggleBlockUserMutation, useDeleteUserMutation } from "../../features/admin/adminApi";
import { Table, Td, EmptyRow } from "../../components/ui/Table";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";

const BG_OPTIONS = ["","A+","A-","B+","B-","O+","O-","AB+","AB-"];

export default function AdminUsers() {
  const [filters, setFilters] = useState({ role:"", status:"", bloodGroup:"" });
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, isLoading } = useGetAdminUsersQuery({ ...filters, page, limit:15 });
  const [toggleBlock, { isLoading: blocking }] = useToggleBlockUserMutation();
  const [deleteUser,  { isLoading: deleting }] = useDeleteUserMutation();

  const users = data?.data || [];

  const handleBlock = async (id) => {
    try { await toggleBlock(id).unwrap(); toast.success("User status updated"); }
    catch (e) { toast.error(e?.data?.message || "Failed"); }
  };

  const handleDelete = async () => {
    try { await deleteUser(confirmDelete._id).unwrap(); toast.success("User deleted"); setConfirmDelete(null); }
    catch (e) { toast.error(e?.data?.message || "Failed"); }
  };

  const setF = (k, v) => { setFilters((p) => ({ ...p, [k]: v })); setPage(1); };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      {/* Filters */}
      <Card style={{ padding:"16px 20px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"12px" }}>
          <select value={filters.role} onChange={(e)=>setF("role",e.target.value)} style={sel}>
            <option value="">All Roles</option>
            <option value="donor">Donor</option>
            <option value="receiver">Receiver</option>
          </select>
          <select value={filters.status} onChange={(e)=>setF("status",e.target.value)} style={sel}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <select value={filters.bloodGroup} onChange={(e)=>setF("bloodGroup",e.target.value)} style={sel}>
            <option value="">All Blood Groups</option>
            {BG_OPTIONS.filter(Boolean).map((g)=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </Card>

      <Card style={{ padding:0 }}>
        <div style={{ padding:"18px 22px", borderBottom:"1px solid #2A2A30" }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700 }}>Users ({data?.total || 0})</h3>
        </div>
        <Table columns={["Name","Blood","Role","Location","Status","Actions"]} loading={isLoading}>
          {users.length === 0 && !isLoading
            ? <EmptyRow cols={6} message="No users found" icon="👥" />
            : users.map((u) => (
              <tr key={u._id}>
                <Td><p style={{ fontWeight:600 }}>{u.name}</p><p style={{ fontSize:"12px", color:"#8E8E9A" }}>{u.email}</p></Td>
                <Td><BloodBadge group={u.bloodGroup} /></Td>
                <Td><Badge status={u.role} /></Td>
                <Td style={{ color:"#8E8E9A", fontSize:"13px" }}>📍 {u.location?.city || "—"}</Td>
                <Td><Badge status={u.status} /></Td>
                <Td>
                  <div style={{ display:"flex", gap:"6px" }}>
                    <Button size="sm" variant={u.status==="blocked"?"success":"warning"} loading={blocking} onClick={()=>handleBlock(u._id)}>
                      {u.status==="blocked"?"Unblock":"Block"}
                    </Button>
                    <Button size="sm" variant="danger" onClick={()=>setConfirmDelete(u)}>Delete</Button>
                  </div>
                </Td>
              </tr>
            ))
          }
        </Table>
        {data?.pages > 1 && (
          <div style={{ display:"flex", justifyContent:"center", gap:"8px", padding:"14px" }}>
            {Array.from({ length: data.pages },(_,i)=>i+1).map((p)=>(
              <button key={p} onClick={()=>setPage(p)} style={{ width:"32px", height:"32px", borderRadius:"8px", border:"1px solid #2A2A30", background:page===p?"#E8192C":"#1F1F24", color:page===p?"#fff":"#8E8E9A", cursor:"pointer" }}>{p}</button>
            ))}
          </div>
        )}
      </Card>

      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={()=>setConfirmDelete(null)}>
          <p style={{ color:"#8E8E9A", marginBottom:"20px" }}>Delete <strong style={{color:"#F5F5F7"}}>{confirmDelete.name}</strong>? This cannot be undone.</p>
          <div style={{ display:"flex", gap:"10px" }}>
            <Button full variant="danger" loading={deleting} onClick={handleDelete}>Yes, Delete</Button>
            <Button full variant="ghost" onClick={()=>setConfirmDelete(null)}>Cancel</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const sel = { width:"100%", padding:"10px 14px", background:"#1F1F24", border:"1px solid #2A2A30", borderRadius:"10px", color:"#F5F5F7", fontSize:"13px", fontFamily:"'DM Sans',sans-serif", outline:"none" };
