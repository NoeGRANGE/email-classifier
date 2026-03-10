export default function DeprecatedPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background-image)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "white",
          borderRadius: "var(--radius)",
          padding: "2.5rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "var(--primary-color-alpha)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: "1.75rem",
          }}
        >
          📦
        </div>
        <h1
          style={{
            fontSize: "1.375rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.75rem",
          }}
        >
          This project is no longer maintained
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
          }}
        >
          The hosted version of this app has been shut down. The project is open
          source — you can clone it and run it yourself for free.
        </p>
        <a
          href="https://github.com/NoeGRANGE/email-classifier"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            background: "var(--gradient)",
            color: "white",
            fontWeight: 600,
            padding: "0.65rem 1.5rem",
            borderRadius: "var(--radius)",
            textDecoration: "none",
          }}
        >
          View on GitHub →
        </a>
      </div>
    </main>
  );
}
