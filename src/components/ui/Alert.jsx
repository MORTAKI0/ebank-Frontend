function Alert({ children, className = "", variant = "error" }) {
  const classes = ["ui-alert", `ui-alert--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="alert">
      {children}
    </div>
  );
}

export default Alert;
