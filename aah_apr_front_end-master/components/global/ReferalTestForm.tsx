"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

export default function ConsentReferralForm() {
  // Question states
  const [q1Yes, setQ1Yes] = useState(false);
  const [q1Text, setQ1Text] = useState("");

  const [q2Yes, setQ2Yes] = useState(false);
  const [consentRead, setConsentRead] = useState(false);

  // Referral table states
  const [caseNo, setCaseNo] = useState("");
  const [dateOfReferral, setDateOfReferral] = useState("");
  const [referralTypeInternal, setReferralTypeInternal] = useState(false);
  const [referralTypeExternal, setReferralTypeExternal] = useState(false);
  const [consentProvided, setConsentProvided] = useState<"yes" | "no" | "">("");
  const [consentReason, setConsentReason] = useState("");

  // Referred By / To
  const [referredBy, setReferredBy] = useState({
    name: "",
    agency: "",
    phone: "",
    email: "",
    address: "",
  });
  const [referredTo, setReferredTo] = useState({
    name: "",
    agency: "",
    phone: "",
    email: "",
    address: "",
  });

  // Reason of referral
  const [reasons, setReasons] = useState({
    mentalHealthAlert: "",
    selfHarm: "",
    suicideIdeation: "",
    undiagnosedPsychosis: "",
  });

  // Services requested
  const servicesList = [
    "Alternative care",
    "Security (safe shelter)",
    "Education (formal)",
    "Non-formal education",
    "S/GBV specialized care",
    "Family tracing and reunification",
    "Basic psychosocial support",
    "Food",
    "Non-food items",
    "Documentation",
    "Services for beneficiary with disabilities",
    "Shelter",
    "WASH",
    "Relocation",
    "Cash assistance",
    "Livelihoods",
    "Sexual & reproductive health",
    "Protection issues",
    "Others (please specify)",
    "General health & medical support",
    "Nutrition",
    "Legal support",
  ];
  const [selectedServices, setSelectedServices] = useState<
    Record<string, boolean>
  >(() => servicesList.reduce((acc, s) => ({ ...acc, [s]: false }), {}));
  const [otherServiceText, setOtherServiceText] = useState("");

  // Expected outcome
  const [expectedOutcome, setExpectedOutcome] = useState("");

  // Final row
  const [providerAcceptsYes, setProviderAcceptsYes] = useState(false);
  const [providerAcceptsNo, setProviderAcceptsNo] = useState(false);
  const [notAcceptedReason, setNotAcceptedReason] = useState("");

  function toggleService(name: string) {
    setSelectedServices((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      q1: { q1Yes, q1Text },
      q2: { q2Yes, consentRead },
      referralTable: {
        caseNo,
        dateOfReferral,
        referralTypeInternal,
        referralTypeExternal,
        consentProvided,
        consentReason,
        referredBy,
        referredTo,
      },
      reasons,
      services: { selectedServices, otherServiceText },
      expectedOutcome,
      final: { providerAcceptsYes, providerAcceptsNo, notAcceptedReason },
    };
    // For demo: output to console. Replace with API call as needed.
    console.log("Consent & Referral form submit:", payload);
    alert("Form submitted (check console).");
  }

  // Utility: input style to keep inputs borderless until focus (subtle bottom border on focus)
  const inputStyle =
    "w-full border-0 border-b border-transparent focus:border-gray-300 focus:border-b focus:outline-none rounded-none";

  const smallInputStyle =
    "border-0 border-b border-transparent focus:border-gray-300 focus:border-b focus:outline-none rounded-none";

  return (
    <form>
      <Card className="w-full max-w-5xl mx-auto p-4">
        <CardHeader className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Consent & Referral Form</CardTitle>
          </div>

          <div>
            {/* Edit Icon Button */}
            <Button variant="ghost" size="sm" aria-label="Edit form">
              {/* simple pencil svg */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l9.414-9.414a1 1 0 000-1.414L15.707 4.293a1 1 0 00-1.414 0L4.293 14.293A1 1 0 004 15v4z"
                />
              </svg>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question 1 */}
          <div className="space-y-2">
            <Label className="font-medium">
              1. Is there or do you have any concern regarding and before the
              referral?
            </Label>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="q1-yes"
                  checked={q1Yes}
                  onCheckedChange={(val) => setQ1Yes(Boolean(val))}
                />
                <label htmlFor="q1-yes">Yes</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="q1-no"
                  checked={!q1Yes}
                  onCheckedChange={() => {
                    setQ1Yes(false);
                    setQ1Text("");
                  }}
                />
                <label htmlFor="q1-no">No</label>
              </div>
            </div>

            {q1Yes && (
              <div className="mt-2">
                <Input
                  placeholder="Please explain..."
                  value={q1Text}
                  onChange={(e) => setQ1Text(e.target.value)}
                  className={inputStyle}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Question 2 */}
          <div className="space-y-2">
            <Label className="font-medium">
              2. In case you need further support, do you want to be referred to
              any other service provider for additional support?
            </Label>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="q2-yes"
                  checked={q2Yes}
                  onCheckedChange={(v) => setQ2Yes(Boolean(v))}
                />
                <label htmlFor="q2-yes">Yes</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="q2-no"
                  checked={!q2Yes}
                  onCheckedChange={() => {
                    setQ2Yes(false);
                    setConsentRead(false);
                  }}
                />
                <label htmlFor="q2-no">No</label>
              </div>
            </div>

            {/* Conditional detailed consent text */}
            {q2Yes && (
              <div className="mt-3 pl-4 border-l-2 border-transparent">
                <div className="text-sm">
                  I{" "}
                  <span className="inline-block w-48 border-b border-gray-200 align-middle" />{" "}
                  by saying 'Yes', to the question 2 in referral, give my
                  consent to Action Against Hunger to refer me to the
                  appropriate service provider in order for me to receive
                  appropriate (additional) assistance. This includes the sharing
                  of my personal information by the organization with the third
                  party service provider.
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Checkbox
                    id="consent-read"
                    checked={consentRead}
                    onCheckedChange={(v) => setConsentRead(Boolean(v))}
                  />
                  <label htmlFor="consent-read">
                    I have read and understood the below information
                  </label>
                </div>

                <ul className="mt-2 pl-6 list-disc text-sm space-y-1">
                  <li>
                    The organization referring is only interested in seeking
                    additional assistance for the individual.
                  </li>
                  <li>
                    The above-mentioned points are my current
                    problem/complaints, it has told by me/relative ... & it is
                    ok.
                  </li>
                  <li>
                    I have been informed of any possible positive or negative
                    effects of this referral by the organization.
                  </li>
                  <li>
                    In case I face any challenges with the service provider
                    after the referral has been made, I acknowledge that the
                    organization that made the referral does not bear
                    responsibility for that.
                  </li>
                </ul>
              </div>
            )}
          </div>

          <Separator />

          {/* Referral Details Table (two-column layout) */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Case No (referring agency)</Label>
                <Input
                  placeholder="Enter case no."
                  className={inputStyle}
                  value={caseNo}
                  onChange={(e) => setCaseNo(e.target.value)}
                />

                <div className="mt-3">
                  <Label className="text-sm">Type of referral</Label>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="type-internal"
                        checked={referralTypeInternal}
                        onCheckedChange={(v) =>
                          setReferralTypeInternal(Boolean(v))
                        }
                      />
                      <label htmlFor="type-internal">Internal</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="type-external"
                        checked={referralTypeExternal}
                        onCheckedChange={(v) =>
                          setReferralTypeExternal(Boolean(v))
                        }
                      />
                      <label htmlFor="type-external">External</label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Date of referral</Label>
                <Input
                  type="date"
                  className={inputStyle}
                  value={dateOfReferral}
                  onChange={(e) => setDateOfReferral(e.target.value)}
                />

                <div className="mt-3">
                  <Label className="text-sm">
                    Has consent / assent been provided?
                  </Label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="consent-yes"
                        checked={consentProvided === "yes"}
                        onCheckedChange={() => setConsentProvided("yes")}
                      />
                      <label htmlFor="consent-yes">Yes</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="consent-no"
                        checked={consentProvided === "no"}
                        onCheckedChange={() => setConsentProvided("no")}
                      />
                      <label htmlFor="consent-no">No; please specify why</label>

                      <Input
                        placeholder="Why?"
                        className={`${smallInputStyle} w-48`}
                        value={consentReason}
                        onChange={(e) => setConsentReason(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-2">
              {/* Referred By */}
              <div className="space-y-2">
                <Label>Referred By</Label>
                <Input
                  placeholder="Name"
                  className={inputStyle}
                  value={referredBy.name}
                  onChange={(e) =>
                    setReferredBy((p) => ({ ...p, name: e.target.value }))
                  }
                />
                <Input
                  placeholder="Agency / Organization / Department"
                  className={inputStyle}
                  value={referredBy.agency}
                  onChange={(e) =>
                    setReferredBy((p) => ({ ...p, agency: e.target.value }))
                  }
                />
                <Input
                  placeholder="Phone"
                  className={inputStyle}
                  value={referredBy.phone}
                  onChange={(e) =>
                    setReferredBy((p) => ({ ...p, phone: e.target.value }))
                  }
                />
                <Input
                  placeholder="Email"
                  className={inputStyle}
                  value={referredBy.email}
                  onChange={(e) =>
                    setReferredBy((p) => ({ ...p, email: e.target.value }))
                  }
                />
                <Input
                  placeholder="Address"
                  className={inputStyle}
                  value={referredBy.address}
                  onChange={(e) =>
                    setReferredBy((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>

              {/* Referred To */}
              <div className="space-y-2">
                <Label>Referred To</Label>
                <Input
                  placeholder="Name"
                  className={inputStyle}
                  value={referredTo.name}
                  onChange={(e) =>
                    setReferredTo((p) => ({ ...p, name: e.target.value }))
                  }
                />
                <Input
                  placeholder="Agency / Organization / Department"
                  className={inputStyle}
                  value={referredTo.agency}
                  onChange={(e) =>
                    setReferredTo((p) => ({ ...p, agency: e.target.value }))
                  }
                />
                <Input
                  placeholder="Phone"
                  className={inputStyle}
                  value={referredTo.phone}
                  onChange={(e) =>
                    setReferredTo((p) => ({ ...p, phone: e.target.value }))
                  }
                />
                <Input
                  placeholder="Email"
                  className={inputStyle}
                  value={referredTo.email}
                  onChange={(e) =>
                    setReferredTo((p) => ({ ...p, email: e.target.value }))
                  }
                />
                <Input
                  placeholder="Address"
                  className={inputStyle}
                  value={referredTo.address}
                  onChange={(e) =>
                    setReferredTo((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Single Column Sections */}
          <div className="space-y-3">
            <Label>Reason of referral</Label>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-56 text-sm">Mental health alert</div>
                <Input
                  placeholder="Description"
                  className={inputStyle}
                  value={reasons.mentalHealthAlert}
                  onChange={(e) =>
                    setReasons((p) => ({
                      ...p,
                      mentalHealthAlert: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-56 text-sm">Self-Harm</div>
                <Input
                  placeholder="Description"
                  className={inputStyle}
                  value={reasons.selfHarm}
                  onChange={(e) =>
                    setReasons((p) => ({ ...p, selfHarm: e.target.value }))
                  }
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-56 text-sm">Suicide ideation/Attempt</div>
                <Input
                  placeholder="Description"
                  className={inputStyle}
                  value={reasons.suicideIdeation}
                  onChange={(e) =>
                    setReasons((p) => ({
                      ...p,
                      suicideIdeation: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-56 text-sm">
                  Potential undiagnosed psychosis
                </div>
                <Input
                  placeholder="Description"
                  className={inputStyle}
                  value={reasons.undiagnosedPsychosis}
                  onChange={(e) =>
                    setReasons((p) => ({
                      ...p,
                      undiagnosedPsychosis: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Services requested */}
          <div className="space-y-3">
            <Label>Type of services requested</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {servicesList.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <Checkbox
                    id={s}
                    checked={!!selectedServices[s]}
                    onCheckedChange={() => toggleService(s)}
                  />
                  <label htmlFor={s} className="text-sm">
                    {s}
                  </label>
                </div>
              ))}
            </div>

            {/* if Others selected show input */}
            {selectedServices["Others (please specify)"] && (
              <div className="mt-2">
                <Input
                  placeholder="Please specify other service"
                  className={inputStyle}
                  value={otherServiceText}
                  onChange={(e) => setOtherServiceText(e.target.value)}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Expected outcome */}
          <div className="space-y-2">
            <Label>Expected outcome of the service(s) requested</Label>
            <Textarea
              placeholder="Describe what you and the person being referred is hoping to achieve through the referral."
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              className="border-0 border-b border-transparent focus:border-gray-300 focus:border-b focus:outline-none rounded-none"
              rows={4}
            />
          </div>

          <Separator />

          {/* Final Row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Does the service provider accept referral?</Label>
              <div className="flex items-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="provider-yes"
                    checked={providerAcceptsYes}
                    onCheckedChange={(v) => {
                      setProviderAcceptsYes(Boolean(v));
                      if (v) setProviderAcceptsNo(false);
                    }}
                  />
                  <label htmlFor="provider-yes">Yes</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="provider-no"
                    checked={providerAcceptsNo}
                    onCheckedChange={(v) => {
                      setProviderAcceptsNo(Boolean(v));
                      if (v) setProviderAcceptsYes(false);
                    }}
                  />
                  <label htmlFor="provider-no">No</label>
                </div>
              </div>
            </div>

            <div>
              <Label>
                If referral was not accepted by the service provider, state
                reasons:
              </Label>
              <Input
                placeholder="Reason"
                className={inputStyle}
                value={notAcceptedReason}
                onChange={(e) => setNotAcceptedReason(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              id={SUBMIT_BUTTON_PROVIDER_ID}
              type="button"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
