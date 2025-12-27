function Input({ label, className = "", ...props }) {
  const classes = ["ui-input", className].filter(Boolean).join(" ");

  return (
    <label className={classes}>
      <span className="ui-input__label">{label}</span>
      <input className="ui-input__control" {...props} />
    </label>
  );
}

export default Input;
