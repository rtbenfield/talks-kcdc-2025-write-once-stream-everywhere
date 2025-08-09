export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const date = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});
