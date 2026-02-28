import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { json, redirect } from "@remix-run/node";
import { db } from "../db"

export async function action({request}) {
	const formData = await request.formData();
	// parsing
	const title = String(formData.get('title'));

	const error = {};
	// validation
	if(!title) {
		error.title = "Title is required.";
	}

	const hasError = +Object.keys(error)?.length;
	if(!!hasError) {
		return json({ success: false, error });
	}

	// commit into db
	try {
		await db.execute("INSERT INTO todo_list (title) VALUES (?)", [ title.trim() ]);
	} catch(error) {
		throw json({ success:false, message: error?.message || "Internal server error"}, { status: 500 }) 
	}

	return redirect("/");
}

export async function loader() {
	let data = [];
	try {
		const [results] = await db.query('SELECT title FROM todo_list ORDER BY created_at DESC');
		data = results;
	} catch(error) {
		throw json({ success:false, message: error?.message || "Internal server error"}, { status: 500 }) 
	}

	return json({success: true, data });
}

export default function Root() {
	const actionData = useActionData();
	const { data: todos } = useLoaderData();

	return (
		<html>
			<head>
				<title>My Remix Todo Application</title>
			</head>
			<body>
				<h1>Todo list</h1>
				<Form method="post">
					<input name="title" type="text" />
					{actionData?.error?.title && <span>{actionData?.error?.title}</span>}
					<button>Save</button>
				</Form>

				{todos?.length > 0 && 
					<ul>
						{todos.map((t,x) => <li key={x}>{t.title}</li>)}			
					</ul>
				}
			</body>
		</html>
	);
}