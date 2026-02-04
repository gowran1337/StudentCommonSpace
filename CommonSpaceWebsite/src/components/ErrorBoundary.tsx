import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import ErrorPage from '../pages/ErrorPage';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error details to console in development
        console.error('Error caught by ErrorBoundary:', error, errorInfo);

        // You can also log the error to an error reporting service here
        // logErrorToService(error, errorInfo);
    }

    resetError = (): void => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorPage
                    error={this.state.error || undefined}
                    resetError={this.resetError}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
