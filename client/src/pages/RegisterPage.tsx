import { Link } from 'react-router-dom';

export function RegisterPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          'linear-gradient(148.73deg, #fafbfc 0%, #fcfcfd 16.667%, #fdfefe 33.333%, #fff 50%, #fdfeff 57.143%, #fafcff 64.286%, #f8fbff 71.429%, #f6faff 78.571%, #f4f9ff 85.714%, #f1f7ff 92.857%, #eff6ff 100%)',
      }}
    >
      <div className="bg-white border border-border rounded-auth-card shadow-auth-card w-full max-w-[440px] p-[41px] text-center">
        <h1 className="text-2xl font-semibold text-text-primary">Create an account</h1>
        <p className="mt-2 text-sm text-text-muted">Registration coming soon.</p>
        <Link
          to="/login"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
