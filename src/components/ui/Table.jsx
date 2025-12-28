function Table({ columns = [], rows = [], renderRow }) {
  const wrapperStyle = {
    width: "100%",
    overflowX: "auto",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    background: "var(--surface)",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const headerCellStyle = {
    textAlign: "left",
    padding: "0.75rem 1rem",
    fontSize: "0.7rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    background: "var(--surface-muted)",
    borderBottom: "1px solid var(--border)",
  };

  const bodyCellStyle = {
    padding: "0.75rem 1rem",
    borderBottom: "1px solid var(--border)",
    fontSize: "0.95rem",
    color: "#1f2937",
  };

  return (
    <div style={wrapperStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key || column.label} style={headerCellStyle}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map((row, index) => renderRow(row, index, bodyCellStyle))}</tbody>
      </table>
    </div>
  );
}

export default Table;
