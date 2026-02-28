import { Resend } from "resend";
import { env } from "~/config/env";
import { VERIFY_EMAIL_TEMPLATE_ID } from "~/utils/constants";

export const resend = new Resend(env.RESEND_API_KEY);

export function getVerifyEmailTemplate(name: string, verification_url: string) {
  return {
    id: VERIFY_EMAIL_TEMPLATE_ID,
    variables: {
      name,
      verification_url,
    },
  };
}
