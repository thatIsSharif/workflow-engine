"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import WorkflowTimeline from "@/components/WorkflowTimeline";
import ActionButtons from "@/components/ActionButtons";
import { useUser } from "@/store/user-context";
import { getByModule, getApplicationStatus, getWorkflowHistory, fetchUsers } from "@/lib/api";
import { MODULE_LABELS, MODULE_ICONS, WORKFLOW_CONFIG } from "@/lib/types";
import type { ModuleType, DomainReadBase, ApplicationStatus, WorkflowHistoryEntry, User } from "@/lib/types";

const moduleMap: Record<string, ModuleType> = {
  noc: "NOC",
  loa: "LOA",
  finance: "FINANCE",
  rental: "RENTAL",
  cancellation: "CANCELLATION",
};

type FieldDef = { label: string; value: string };

export default function ApplicationDetailPage() {
  const params = useParams();
  const moduleSlug = params.module as string;
  const appId = params.id as string;
  const moduleType = moduleMap[moduleSlug];

  const { user, isLoading } = useUser();
  const router = useRouter();

  const [application, setApplication] = useState<DomainReadBase | null>(null);
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const [history, setHistory] = useState<WorkflowHistoryEntry[]>([]);
  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [pageLoading, setPageLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!moduleType || !appId) return;
    try {
      const [app, appStatus, appHistory, users] = await Promise.all([
        getByModule(moduleType, appId),
        getApplicationStatus(moduleType, appId),
        getWorkflowHistory(moduleType, appId),
        fetchUsers(),
      ]);
      setApplication(app);
      setStatus(appStatus);
      setHistory(appHistory);
      const map: Record<number, string> = {};
      users.forEach((u: User) => { map[u.id] = u.name; });
      setUserMap(map);
    } catch (e) {
      console.error("Failed to load application:", e);
    } finally {
      setPageLoading(false);
    }
  }, [moduleType, appId]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push("/"); return; }
    if (!moduleType) { router.push("/applications"); return; }
    loadData();
  }, [user, isLoading, moduleType, router, loadData]);

  function getFields(): FieldDef[] {
    if (!application) return [];
    const r = application as unknown as Record<string, unknown>;
    switch (moduleType) {
      case "NOC":
        return [
          { label: "Applicant Name", value: r.applicant_name as string },
          { label: "Applicant Email", value: r.applicant_email as string },
          { label: "Purpose", value: r.purpose as string },
          { label: "Property Address", value: r.property_address as string },
          { label: "Valid From", value: r.valid_from as string },
          { label: "Valid To", value: r.valid_to as string },
        ];
      case "LOA":
        return [
          { label: "Applicant Name", value: r.applicant_name as string },
          { label: "Applicant Email", value: r.applicant_email as string },
          { label: "Authorized Person", value: r.authorized_person_name as string },
          { label: "Authorized Person ID", value: r.authorized_person_id as string },
          { label: "Scope of Authorization", value: r.scope_of_authorization as string },
          { label: "Valid From", value: r.valid_from as string },
          { label: "Valid To", value: r.valid_to as string },
        ];
      case "FINANCE":
        return [
          { label: "Applicant Name", value: r.applicant_name as string },
          { label: "Department", value: r.department as string },
          { label: "Amount", value: `$${r.amount}` },
          { label: "Purpose", value: r.purpose as string },
          { label: "Supporting Document", value: (r.supporting_document_ref as string) || "N/A" },
        ];
      case "RENTAL":
        return [
          { label: "Tenant Name", value: r.tenant_name as string },
          { label: "Tenant Email", value: r.tenant_email as string },
          { label: "Property Address", value: r.property_address as string },
          { label: "Rental Amount", value: `$${r.rental_amount}` },
          { label: "Lease Start", value: r.lease_start as string },
          { label: "Lease End", value: r.lease_end as string },
        ];
      case "CANCELLATION":
        return [
          { label: "Applicant Name", value: r.applicant_name as string },
          { label: "Reference App ID", value: r.reference_application_id as string },
          { label: "Reference App Type", value: r.reference_application_type as string },
          { label: "Reason", value: r.reason as string },
        ];
      default:
        return [];
    }
  }

  if (isLoading || !user || !moduleType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const currentState = status?.current_state || application?.status || "";
  const config = WORKFLOW_CONFIG[moduleType];
  const stateIndex = config ? config.states.indexOf(currentState) : -1;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span>/</span>
          <Link href="/applications" className="hover:text-gray-700">Applications</Link>
          <span>/</span>
          <Link href={`/applications/${moduleSlug}`} className="hover:text-gray-700">{MODULE_LABELS[moduleType]}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{appId}</span>
        </div>

        {pageLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : !application ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Application not found.</p>
            <Link href={`/applications/${moduleSlug}`} className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block">
              Back to {MODULE_LABELS[moduleType]} applications
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application details card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{MODULE_ICONS[moduleType]}</span>
                    <h2 className="text-xl font-bold text-gray-900">
                      {MODULE_LABELS[moduleType]} Application
                    </h2>
                  </div>
                  <StatusBadge status={currentState} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFields().map((field) => (
                    <div key={field.label}>
                      <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{field.value}</dd>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created By</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {userMap[application.created_by] || `User #${application.created_by}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Version</dt>
                    <dd className="mt-1 text-sm text-gray-900">{application.version}</dd>
                  </div>
                </div>
              </div>

              {/* Workflow history */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow History</h3>
                <WorkflowTimeline history={history} userNameMap={userMap} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">State</span>
                    <StatusBadge status={currentState} size="sm" />
                  </div>
                  {status && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Last Action</span>
                        <span className="text-sm font-medium text-gray-900">
                          {status.last_action || "None"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Pending Roles</span>
                        <span className="text-sm text-gray-900">
                          {status.pending_roles ? JSON.parse(status.pending_roles).join(", ") : "None"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Progress bar */}
                {config && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-1">
                      Step {stateIndex + 1} of {config.states.length}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.round(((stateIndex + 1) / config.states.length) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{config.states[0]}</span>
                      <span className="text-xs text-gray-400">
                        {config.states[config.states.length - 1]}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <ActionButtons
                  module={moduleType}
                  applicationId={appId}
                  currentState={currentState}
                  userRole={user.role}
                  userId={user.id}
                  onActionComplete={loadData}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
