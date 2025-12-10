import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            textAlign: 'center'
        }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>
                Sorry, the page you&#39;re looking for doesn&#39;t exist.
            </p>
            <Link
                href="/"
                style={{
                    marginTop: '2rem',
                    padding: '10px 20px',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    display: 'inline-block'
                }}
            >
                Go Home
            </Link>
        </div>
    );
}
