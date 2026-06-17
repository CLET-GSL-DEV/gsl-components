import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalClose,
  Button,
  Badge,
} from "@rfdtech/components";
import { Mail, Calendar, Shield, Hash, Clock } from "lucide-react";
import type { DemoMember } from "../data/demoMembers";

function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 45%, 88%)`;
}

interface ViewMemberModalProps {
  member: DemoMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function statusVariant(status: string): "default" | "primary" | "success" | "warning" | "error" | "outline" {
  switch (status) {
    case "Active":
      return "success";
    case "Suspended":
      return "warning";
    case "Terminated":
      return "error";
    case "Inactive":
      return "outline";
    case "Pending":
      return "primary";
    default:
      return "default";
  }
}

export function ViewMemberModal({ member, open, onOpenChange }: ViewMemberModalProps) {
  if (!member) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent showCloseButton>
        <ModalHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: nameToColor(member.name),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--gsl-text-secondary)",
                border: "1px solid var(--gsl-border)",
              }}
            >
              {member.initials}
            </div>
            <div>
              <ModalTitle>{member.name}</ModalTitle>
              <div style={{ fontSize: 13, color: "var(--gsl-text-muted)", marginTop: 2 }}>
                {member.email}
              </div>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="demo-member-detail">
            <div className="demo-member-detail__row">
              <span className="demo-member-detail__icon"><Hash size={16} /></span>
              <span className="demo-member-detail__label">ISR</span>
              <span className="demo-member-detail__value">{member.isr}</span>
            </div>
            <div className="demo-member-detail__row">
              <span className="demo-member-detail__icon"><Shield size={16} /></span>
              <span className="demo-member-detail__label">Primary Role</span>
              <span className="demo-member-detail__value">{member.role}</span>
            </div>
            <div className="demo-member-detail__row">
              <span className="demo-member-detail__icon"><Mail size={16} /></span>
              <span className="demo-member-detail__label">Email</span>
              <span className="demo-member-detail__value">{member.email}</span>
            </div>
            <div className="demo-member-detail__row">
              <span className="demo-member-detail__icon"><Calendar size={16} /></span>
              <span className="demo-member-detail__label">Last Login</span>
              <span className="demo-member-detail__value">
                {member.lastLoginDate}
                <span style={{ color: "var(--gsl-text-muted)", marginLeft: 8 }}>
                  <Clock size={13} style={{ verticalAlign: -1, marginRight: 4 }} />
                  {member.lastLoginTime}
                </span>
              </span>
            </div>
            <div className="demo-member-detail__row">
              <span className="demo-member-detail__icon">
                <span style={{ fontSize: 14, lineHeight: 1 }}>●</span>
              </span>
              <span className="demo-member-detail__label">Status</span>
              <span className="demo-member-detail__value">
                <Badge variant={statusVariant(member.status)}>{member.status}</Badge>
              </span>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <ModalClose asChild>
            <Button variant="outline">Close</Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
