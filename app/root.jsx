import { Outlet, useRouteError, isRouteErrorResponse } from '@remix-run/react';

export default function Root() {
	return (
		<html>
			<head>
				<title>My Remix Todo Application</title>
			</head>
			<body>
				<main>
					<Outlet />
				</main>
			</body>
		</html>
	);
}


export function ErrorBoundary() {
	const error = useRouteError();

	if(isRouteErrorResponse(error)) {
		return (
		<h1>{error.status}: {error.data}</h1>
		)
	}
	if(error instanceof Error) {
	    return (
     	 <div>
		    <h1>Error</h1>
		    <p>{error.message}</p>
		    <p>The stack trace is:</p>
		    <pre>{error.stack}</pre>
		  </div>
		)
	}

	  return <h1>Unknown Error</h1>;
}