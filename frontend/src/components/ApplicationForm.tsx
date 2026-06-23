"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ModuleType, NOCCreate, LOACreate, FinanceCreate, RentalCreate, CancellationCreate } from "@/lib/types";
import { MODULE_LABELS } from "@/lib/types";
import { createNOC, createLOA, createFinance, createRental, createCancellation } from "@/lib/api";
import { useUser } from "@/store/user-context";

interface ApplicationFormProps {
  module: ModuleType;
}

export default function ApplicationForm({ module }: ApplicationFormProps) {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      let result: { id: string };
      switch (module) {
        case "NOC": {
          const payload: NOCCreate = {
            applicant_name: formData.get("applicant_name") as string,
            applicant_email: formData.get("applicant_email") as string,
            purpose: formData.get("purpose") as string,
            property_address: formData.get("property_address") as string,
            valid_from: formData.get("valid_from") as string,
            valid_to: formData.get("valid_to") as string,
          };
          result = await createNOC(payload);
          break;
        }
        case "LOA": {
          const payload: LOACreate = {
            applicant_name: formData.get("applicant_name") as string,
            applicant_email: formData.get("applicant_email") as string,
            authorized_person_name: formData.get("authorized_person_name") as string,
            authorized_person_id: formData.get("authorized_person_id") as string,
            scope_of_authorization: formData.get("scope_of_authorization") as string,
            valid_from: formData.get("valid_from") as string,
            valid_to: formData.get("valid_to") as string,
          };
          result = await createLOA(payload);
          break;
        }
        case "FINANCE": {
          const payload: FinanceCreate = {
            applicant_name: formData.get("applicant_name") as string,
            department: formData.get("department") as string,
            amount: parseFloat(formData.get("amount") as string),
            purpose: formData.get("purpose") as string,
            supporting_document_ref: (formData.get("supporting_document_ref") as string) || undefined,
          };
          result = await createFinance(payload);
          break;
        }
        case "RENTAL": {
          const payload: RentalCreate = {
            tenant_name: formData.get("tenant_name") as string,
            tenant_email: formData.get("tenant_email") as string,
            property_address: formData.get("property_address") as string,
            rental_amount: parseFloat(formData.get("rental_amount") as string),
            lease_start: formData.get("lease_start") as string,
            lease_end: formData.get("lease_end") as string,
          };
          result = await createRental(payload);
          break;
        }
        case "CANCELLATION": {
          const payload: CancellationCreate = {
            applicant_name: formData.get("applicant_name") as string,
            reference_application_id: formData.get("reference_application_id") as string,
            reference_application_type: formData.get("reference_application_type") as string,
            reason: formData.get("reason") as string,
          };
          result = await createCancellation(payload);
          break;
        }
      }
      router.push(`/applications/${module.toLowerCase()}/${result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create application");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const renderFields = () => {
    switch (module) {
      case "NOC":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Applicant Name</label>
                <input name="applicant_name" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Applicant Email</label>
                <input name="applicant_email" type="email" required className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Purpose</label>
              <textarea name="purpose" required rows={3} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Property Address</label>
              <input name="property_address" required className={inputClass} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Valid From</label>
                <input name="valid_from" type="date" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Valid To</label>
                <input name="valid_to" type="date" required className={inputClass} />
              </div>
            </div>
          </>
        );
      case "LOA":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Applicant Name</label>
                <input name="applicant_name" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Applicant Email</label>
                <input name="applicant_email" type="email" required className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Authorized Person Name</label>
                <input name="authorized_person_name" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Authorized Person ID</label>
                <input name="authorized_person_id" required className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Scope of Authorization</label>
              <textarea name="scope_of_authorization" required rows={3} className={inputClass} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Valid From</label>
                <input name="valid_from" type="date" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Valid To</label>
                <input name="valid_to" type="date" required className={inputClass} />
              </div>
            </div>
          </>
        );
      case "FINANCE":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Applicant Name</label>
                <input name="applicant_name" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <input name="department" required className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Amount</label>
                <input name="amount" type="number" step="0.01" min="0" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Supporting Document Ref</label>
                <input name="supporting_document_ref" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Purpose</label>
              <textarea name="purpose" required rows={3} className={inputClass} />
            </div>
          </>
        );
      case "RENTAL":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tenant Name</label>
                <input name="tenant_name" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tenant Email</label>
                <input name="tenant_email" type="email" required className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Property Address</label>
              <input name="property_address" required className={inputClass} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Rental Amount</label>
                <input name="rental_amount" type="number" step="0.01" min="0" required className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Lease Start</label>
                <input name="lease_start" type="date" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Lease End</label>
                <input name="lease_end" type="date" required className={inputClass} />
              </div>
            </div>
          </>
        );
      case "CANCELLATION":
        return (
          <>
            <div>
              <label className={labelClass}>Applicant Name</label>
              <input name="applicant_name" required className={inputClass} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Reference Application ID</label>
                <input name="reference_application_id" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Reference Application Type</label>
                <select name="reference_application_type" required className={inputClass}>
                  <option value="">Select type...</option>
                  <option value="NOC">NOC</option>
                  <option value="LOA">LOA</option>
                  <option value="FINANCE">Finance</option>
                  <option value="RENTAL">Rental</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Reason</label>
              <textarea name="reason" required rows={3} className={inputClass} />
            </div>
          </>
        );
    }
  };

  return (
    <form action={handleSubmit} className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          New {MODULE_LABELS[module]} Application
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {renderFields()}

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !user}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating..." : "Create Application"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
