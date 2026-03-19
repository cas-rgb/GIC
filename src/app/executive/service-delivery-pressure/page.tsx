// src/app/executive/service-delivery-pressure/page.tsx
import { redirect } from "next/navigation";

export const metadata = {
  title:
    "Service Delivery Pressure & Early Warning | GIC Executive Intelligence",
  description:
    "Operational risk and response console for the Gauteng Infrastructure Company.",
};

export default function ServiceDeliveryPressurePage() {
  redirect("/analytics");
}
