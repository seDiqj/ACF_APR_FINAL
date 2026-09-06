"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MultiSelect } from "../multi-select";
import { useParentContext } from "@/contexts/ParentContext";
import { useParams } from "next/navigation";
import { ReferralInterface } from "@/interfaces/Interfaces";

import {
  ReferralFormPersonalInforType,
  ReferralReasonFormType,
  ReferredByAndReferredToFormType,
} from "@/types/Types";

import {
  ReasoneOfReferralDefault,
  ReferralFormPersonalInfoDefault,
  ReferredByAndReferredToDefault,
} from "@/constants/FormsDefaultValues";

import {
  LanguagesOptions,
  servicesOptions,
} from "@/constants/SingleAndMultiSelectOptionsList";

import { ReferralSubmitButtonMessage } from "@/constants/ConfirmationModelsTexts";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

const ReferralForm: React.FC<ReferralInterface> = ({
  beneficiaryInfo,
  referralInfo,
}) => {
  const { id } = useParams<{ id: string }>();

  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
  } = useParentContext();

  // ============================
  // Question states
  // ============================

  const [q1Yes, setQ1Yes] = useState<boolean>(false);
  const [q1Text, setQ1Text] = useState<string>("");

  const [q2Yes, setQ2Yes] = useState<boolean>(false);
  const [consentRead, setConsentRead] = useState<boolean>(false);

  // ============================
  // Referral details
  // ============================

  const [caseNo, setCaseNo] = useState<string>("");
  const [dateOfReferral, setDateOfReferral] = useState<string>("");

  const [referralTypeInternal, setReferralTypeInternal] =
    useState<boolean>(false);

  const [referralTypeExternal, setReferralTypeExternal] =
    useState<boolean>(false);

  // ============================
  // Consent
  // ============================

  const [consentProvided, setConsentProvided] = useState<"yes" | "no" | "">("");

  const [consentReason, setConsentReason] = useState<string>("");

  // ============================
  // Referred By
  // ============================

  const [referredBy, setReferredBy] = useState<ReferredByAndReferredToFormType>(
    ReferredByAndReferredToDefault()
  );

  // ============================
  // Referred To
  // ============================

  const [referredTo, setReferredTo] = useState<ReferredByAndReferredToFormType>(
    ReferredByAndReferredToDefault()
  );

  // ============================
  // Referral reasons
  // ============================

  const [reasons, setReasons] = useState<ReferralReasonFormType>(
    ReasoneOfReferralDefault()
  );

  // ============================
  // Services
  // ============================

  const [selectedServices, setSelectedServices] = useState<
    Record<string, boolean>
  >(() =>
    servicesOptions.reduce(
      (acc, service) => ({
        ...acc,
        [service]: false,
      }),
      {} as Record<string, boolean>
    )
  );

  const [otherServiceText, setOtherServiceText] = useState<string>("");

  // ============================
  // Expected outcome
  // ============================

  const [expectedOutcome, setExpectedOutcome] = useState<string>("");

  // ============================
  // Provider decision
  // ============================

  const [providerAcceptsYes, setProviderAcceptsYes] = useState<boolean>(false);

  const [providerAcceptsNo, setProviderAcceptsNo] = useState<boolean>(false);

  const [notAcceptedReason, setNotAcceptedReason] = useState<string>("");

  // ============================
  // Personal information
  // ============================

  const [personalInfo, setPersonalInfo] =
    useState<ReferralFormPersonalInforType>(ReferralFormPersonalInfoDefault());

  // ============================
  // Loading
  // ============================

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ============================
  // Referral Type
  // ============================

  const referralType = referralTypeInternal
    ? "internal"
    : referralTypeExternal
    ? "external"
    : "";

  const setReferralType = (value: string) => {
    setReferralTypeInternal(value === "internal");
    setReferralTypeExternal(value === "external");
  };

  // ============================
  // Toggle Service
  // ============================

  function toggleService(name: string) {
    setSelectedServices((previous) => {
      const updated = {
        ...previous,
        [name]: !previous[name],
      };

      if (name === "Others (please specify)" && !updated[name]) {
        setOtherServiceText("");
      }

      return updated;
    });
  }

  // ============================
  // Submit
  // ============================

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const selectedServiceList = Object.keys(selectedServices).filter(
      (service) => selectedServices[service]
    );

    const payload = {
      // Question 1
      referralConcern: q1Yes,

      referralConcernNote: q1Yes ? q1Text : null,

      // Question 2
      needReferral: q2Yes,

      concentGiven: q2Yes ? consentRead : false,

      // Consent
      consentProvided:
        consentProvided === "" ? null : consentProvided === "yes",

      consentReason: consentProvided === "no" ? consentReason : null,

      // Referral details
      caseNumber: caseNo,

      type: referralType || null,

      dateOfReferral: dateOfReferral || null,

      // Referred By
      referrerName: referredBy.name,

      referrerAgency: referredBy.agency,

      referrerPhone: referredBy.phone,

      referrerEmail: referredBy.email,

      referrerAddress: referredBy.address,

      // Referred To
      referredToName: referredTo.name,

      referredToAgency: referredTo.agency,

      referredToPhone: referredTo.phone,

      referredToEmail: referredTo.email,

      referredToAddress: referredTo.address,

      // Personal Info
      nationalId: personalInfo.nationalId,

      currentAddress: personalInfo.currentAddress,

      spokenLanguage: personalInfo.spokenLanguage,

      // Mental Health Alerts
      mentalHealthAlert: [
        reasons.mentalHealthAlert
          ? `reasons.mental$:- ${reasons.mentalHealthAlert}`
          : null,

        reasons.selfHarm ? `reasons.selfHarm$:- ${reasons.selfHarm}` : null,

        reasons.suicideIdeation
          ? `reasons.suicideIdeation$:- ${reasons.suicideIdeation}`
          : null,

        reasons.undiagnosedPsychosis
          ? `reasons.undiagnosedPsychosis$:- ${reasons.undiagnosedPsychosis}`
          : null,
      ].filter(Boolean),

      // Services
      serviceRequested: selectedServiceList,

      otherServiceText: selectedServices["Others (please specify)"]
        ? otherServiceText
        : null,

      // Expected Outcome
      expectedOutcome,

      // Provider Decision
      referralAccepted: providerAcceptsYes
        ? true
        : providerAcceptsNo
        ? false
        : null,

      referralRejectedReasone: providerAcceptsNo ? notAcceptedReason : null,
    };

    setIsLoading(true);

    requestHandler()
      .put(`/referral_db/beneficiary/updateReferral/${id}`, payload)
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message);
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error?.response?.data?.message ?? "Something went wrong!"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  // ============================
  // Load existing data
  // ============================

  useEffect(() => {
    if (!referralInfo) return;

    const referralData = referralInfo;

    // Question 1
    setQ1Yes(referralData.referralConcern ?? false);

    setQ1Text(referralData.referralConcernNote ?? "");

    // Question 2
    setQ2Yes(referralData.needReferral ?? false);

    setConsentRead(referralData.concentGiven ?? false);

    // Referral Details
    setCaseNo(referralData.caseNumber ?? "");

    setDateOfReferral(referralData.dateOfReferral ?? "");

    setReferralTypeInternal(referralData.type === "internal");

    setReferralTypeExternal(referralData.type === "external");

    // Consent
    if (referralData.consentProvided === true) {
      setConsentProvided("yes");
    } else if (referralData.consentProvided === false) {
      setConsentProvided("no");
    } else {
      setConsentProvided("");
    }

    setConsentReason(referralData.consentReason ?? "");

    // Referred By
    setReferredBy({
      name: referralData.referrerName ?? "",
      agency: referralData.referrerAgency ?? "",
      phone: referralData.referrerPhone ?? "",
      email: referralData.referrerEmail ?? "",
      address: referralData.referrerAddress ?? "",
    });

    // Referred To
    setReferredTo({
      name: referralData.referredToName ?? "",
      agency: referralData.referredToAgency ?? "",
      phone: referralData.referredToPhone ?? "",
      email: referralData.referredToEmail ?? "",
      address: referralData.referredToAddress ?? "",
    });

    // Mental Health Alerts
    const findAlert = (key: string) =>
      referralData.mentalHealthAlert
        ?.find((alert: string) => alert.startsWith(key))
        ?.split("$:- ")[1] ?? "";

    setReasons({
      mentalHealthAlert: findAlert("reasons.mental"),

      selfHarm: findAlert("reasons.selfHarm"),

      suicideIdeation: findAlert("reasons.suicideIdeation"),

      undiagnosedPsychosis: findAlert("reasons.undiagnosedPsychosis"),
    });

    // Services
    const updatedServices = servicesOptions.reduce(
      (acc, service) => ({
        ...acc,

        [service]: referralData.serviceRequested?.includes(service) ?? false,
      }),

      {} as Record<string, boolean>
    );

    setSelectedServices(updatedServices);

    // Other Service
    setOtherServiceText(referralData.otherServiceText ?? "");

    // Expected Outcome
    setExpectedOutcome(referralData.expectedOutcome ?? "");

    // Provider Decision
    setProviderAcceptsYes(referralData.referralAccepted === true);

    setProviderAcceptsNo(referralData.referralAccepted === false);

    setNotAcceptedReason(referralData.referralRejectedReasone ?? "");

    // Personal Information
    setPersonalInfo({
      nationalId: referralData.nationalId ?? "",

      currentAddress: referralData.currentAddress ?? "",

      spokenLanguage: referralData.spokenLanguage ?? [],
    });
  }, [referralInfo]);

  // ============================
  // Styles
  // ============================

  const inputStyle =
    "w-full focus:border-gray-300 focus:border-b focus:outline-none rounded-none";

  const smallInputStyle =
    "border-0 border-b border-transparent focus:border-gray-300 focus:border-b focus:outline-none rounded-none";

  return (
    <form>
      <Card className="w-full max-w-5xl mx-auto p-4">
        <CardHeader className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Consent & Referral Form</CardTitle>
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
                  onCheckedChange={(value) => setQ1Yes(Boolean(value))}
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
                <Textarea
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
                  onCheckedChange={(value) => setQ2Yes(Boolean(value))}
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

            {q2Yes && (
              <div className="mt-3 pl-4 border-l-2 border-transparent">
                <div className="text-sm">
                  I {beneficiaryInfo?.name} by saying 'Yes', to the question 2
                  in referral, give my consent to Action Against Hunger to refer
                  me to the appropriate service provider in order for me to
                  receive appropriate (additional) assistance. This includes the
                  sharing of my personal information by the organization with
                  the third party service provider.
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Checkbox
                    id="consent-read"
                    checked={consentRead}
                    onCheckedChange={(value) => setConsentRead(Boolean(value))}
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

          {/* Referral Details */}
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

                  <RadioGroup
                    value={referralType}
                    onValueChange={setReferralType}
                    className="flex items-center gap-6 mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="type-internal" value="internal" />

                      <label htmlFor="type-internal">Internal</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="type-external" value="external" />

                      <label htmlFor="type-external">External</label>
                    </div>
                  </RadioGroup>
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
                        onCheckedChange={() => {
                          setConsentProvided("yes");
                          setConsentReason("");
                        }}
                      />

                      <label htmlFor="consent-yes">Yes</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="consent-no"
                        checked={consentProvided === "no"}
                        onCheckedChange={() => {
                          setConsentProvided("no");
                        }}
                      />

                      <label htmlFor="consent-no">No; please specify why</label>

                      <Input
                        placeholder="Why?"
                        className={`${smallInputStyle} w-48`}
                        value={consentReason}
                        disabled={consentProvided !== "no"}
                        onChange={(e) => setConsentReason(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Referred By / Referred To / Personal Info */}
            <div className="grid grid-cols-2 gap-6 mt-2">
              {/* Referred By */}
              <div className="space-y-2">
                <Label>Referred By</Label>

                <Input
                  placeholder="Name"
                  className={inputStyle}
                  value={referredBy.name}
                  onChange={(e) =>
                    setReferredBy((previous) => ({
                      ...previous,
                      name: e.target.value,
                    }))
                  }
                />

                <Input
                  placeholder="Agency / Organization / Department"
                  className={inputStyle}
                  value={referredBy.agency}
                  onChange={(e) =>
                    setReferredBy((previous) => ({
                      ...previous,
                      agency: e.target.value,
                    }))
                  }
                />

                <Input
                  placeholder="Phone"
                  className={inputStyle}
                  value={referredBy.phone}
                  onChange={(e) =>
                    setReferredBy((previous) => ({
                      ...previous,
                      phone: e.target.value,
                    }))
                  }
                />

                <Input
                  placeholder="Email"
                  className={inputStyle}
                  value={referredBy.email}
                  onChange={(e) =>
                    setReferredBy((previous) => ({
                      ...previous,
                      email: e.target.value,
                    }))
                  }
                />

                <Input
                  placeholder="Address"
                  className={inputStyle}
                  value={referredBy.address}
                  onChange={(e) =>
                    setReferredBy((previous) => ({
                      ...previous,
                      address: e.target.value,
                    }))
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
                    setReferredTo((previous) => ({
                      ...previous,
                      name: e.target.value,
                    }))
                  }
                />

                <Input
                  placeholder="Agency / Organization / Department"
                  className={inputStyle}
                  value={referredTo.agency}
                  onChange={(e) =>
                    setReferredTo((previous) => ({
                      ...previous,
                      agency: e.target.value,
                    }))
                  }
                />

                <Input
                  placeholder="Phone"
                  className={inputStyle}
                  value={referredTo.phone}
                  onChange={(e) =>
                    setReferredTo((previous) => ({
                      ...previous,
                      phone: e.target.value,
                    }))
                  }
                />

                <Input
                  placeholder="Email"
                  className={inputStyle}
                  value={referredTo.email}
                  onChange={(e) =>
                    setReferredTo((previous) => ({
                      ...previous,
                      email: e.target.value,
                    }))
                  }
                />

                <Input
                  placeholder="Address"
                  className={inputStyle}
                  value={referredTo.address}
                  onChange={(e) =>
                    setReferredTo((previous) => ({
                      ...previous,
                      address: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Personal Info */}
              <div className="space-y-2">
                <Label>Personal Info</Label>

                <Input
                  placeholder="National ID ..."
                  className={inputStyle}
                  value={personalInfo.nationalId}
                  onChange={(e) =>
                    setPersonalInfo((previous) => ({
                      ...previous,
                      nationalId: e.target.value,
                    }))
                  }
                />

                <Input
                  placeholder="Current Address"
                  className={inputStyle}
                  value={personalInfo.currentAddress}
                  onChange={(e) =>
                    setPersonalInfo((previous) => ({
                      ...previous,
                      currentAddress: e.target.value,
                    }))
                  }
                />

                <MultiSelect
                  options={LanguagesOptions}
                  value={personalInfo.spokenLanguage}
                  onValueChange={(value: string[]) =>
                    setPersonalInfo((previous) => ({
                      ...previous,
                      spokenLanguage: value,
                    }))
                  }
                  placeholder="Spoken Languages"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Reason of referral */}
          <div className="space-y-3">
            <Label>Reason of referral</Label>

            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-56 text-sm">Mental health alert</div>

                <Textarea
                  placeholder="Description"
                  className={inputStyle}
                  value={reasons.mentalHealthAlert}
                  onChange={(e) =>
                    setReasons((previous) => ({
                      ...previous,
                      mentalHealthAlert: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-56 text-sm">Self-Harm</div>

                <Textarea
                  placeholder="Description"
                  className={inputStyle}
                  value={reasons.selfHarm}
                  onChange={(e) =>
                    setReasons((previous) => ({
                      ...previous,
                      selfHarm: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-56 text-sm">Suicide ideation/Attempt</div>

                <Textarea
                  placeholder="Description"
                  className={inputStyle}
                  value={reasons.suicideIdeation}
                  onChange={(e) =>
                    setReasons((previous) => ({
                      ...previous,
                      suicideIdeation: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-56 text-sm">
                  Potential undiagnosed psychosis
                </div>

                <Textarea
                  placeholder="Description"
                  className={inputStyle}
                  value={reasons.undiagnosedPsychosis}
                  onChange={(e) =>
                    setReasons((previous) => ({
                      ...previous,
                      undiagnosedPsychosis: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div className="space-y-3">
            <Label>Type of services requested</Label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {servicesOptions.map((service) => (
                <div key={service} className="flex items-center gap-2">
                  <Checkbox
                    id={service}
                    checked={!!selectedServices[service]}
                    onCheckedChange={() => toggleService(service)}
                  />

                  <label htmlFor={service} className="text-sm">
                    {service}
                  </label>
                </div>
              ))}
            </div>

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
              className={inputStyle}
              rows={4}
            />
          </div>

          <Separator />

          {/* Provider Acceptance */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Does the service provider accept referral?</Label>

              <div className="flex items-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="provider-yes"
                    checked={providerAcceptsYes}
                    onCheckedChange={() => {
                      setProviderAcceptsYes(true);
                      setProviderAcceptsNo(false);
                      setNotAcceptedReason("");
                    }}
                  />

                  <label htmlFor="provider-yes">Yes</label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="provider-no"
                    checked={providerAcceptsNo}
                    onCheckedChange={() => {
                      setProviderAcceptsNo(true);
                      setProviderAcceptsYes(false);
                    }}
                  />

                  <label htmlFor="provider-no">No</label>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="mb-1">
                If referral was not accepted by the service provider, state
                reasons:
              </Label>

              <Textarea
                placeholder="Reason"
                className={inputStyle}
                disabled={!providerAcceptsNo}
                value={notAcceptedReason}
                onChange={(e) => setNotAcceptedReason(e.target.value)}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              id={SUBMIT_BUTTON_PROVIDER_ID}
              disabled={isLoading}
              type="button"
              onClick={(e) =>
                reqForConfirmationModelFunc(ReferralSubmitButtonMessage, () =>
                  handleSubmit(e)
                )
              }
            >
              {isLoading ? "Saving ..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ReferralForm;
