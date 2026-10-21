/**
 * The Projects Route and its Project pages. `modal` is the inspect window a
 * Project's page opens as when its card is pressed on the inventory
 * (`@modal/(.)[slug]`, an intercepting route); otherwise it is empty.
 */
export default function WhatLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
