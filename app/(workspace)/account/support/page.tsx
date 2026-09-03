import type { Metadata } from "next";
import { Inbox, Mail, Phone } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { SupportTicketReply } from "@/components/support-ticket-reply";

export const metadata: Metadata = { title: "Support inbox" };

type Ticket = {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  subject: string;
  message: string;
  status: string;
  source: string;
  created_at: string;
  agents: { name: string } | { name: string }[] | null;
};

export default async function SupportInboxPage() {
  const { supabase, workspaceId } = await getWorkspaceContext();
  const { data, error } = await supabase
    .from("support_tickets")
    .select("id,requester_name,requester_email,requester_phone,subject,message,status,source,created_at,agents(name)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(100);
  const tickets = (data || []) as unknown as Ticket[];

  return <div className="support-inbox-page">
    <header className="library-head"><div><p className="eyebrow"><Inbox size={13} /> Support inbox</p><h1>Every handoff.<br />One clear queue.</h1><p>Requests from Nori and your customer agents stay inside this workspace.</p></div></header>
    {error ? <section className="support-inbox-empty"><h2>Run the latest Supabase migration.</h2><p>The support and billing schema is not available yet. Apply <code>supabase/OPENCREATIVE_PENDING_MIGRATIONS.sql</code>, then refresh this page.</p></section>
      : tickets.length === 0 ? <section className="support-inbox-empty"><Inbox size={28} /><h2>No open conversations yet.</h2><p>New support tickets will appear here with the customer’s contact details and message.</p></section>
      : <section className="support-ticket-list">{tickets.map((ticket) => {
        const agent = Array.isArray(ticket.agents) ? ticket.agents[0] : ticket.agents;
        return <article key={ticket.id}>
          <header><div><span>{ticket.status}</span><small>{new Date(ticket.created_at).toLocaleString()}</small></div><strong>{agent?.name || "Nori · OpenCreative"}</strong></header>
          <h2>{ticket.subject}</h2><p>{ticket.message}</p>
          <footer><div><span><Mail size={14} /> {ticket.requester_email}</span><span><Phone size={14} /> {ticket.requester_phone}</span></div><SupportTicketReply ticketId={ticket.id} requesterName={ticket.requester_name} /></footer>
        </article>;
      })}</section>}
  </div>;
}
