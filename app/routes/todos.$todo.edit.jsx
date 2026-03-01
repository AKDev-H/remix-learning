import { useLoaderData, useActionData, useRouteError, isRouteErrorResponse, Link, Form } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { db } from '../../db';

export async function loader({ params }) {
	let { todo } = params;
	let selectedTodo = null;

	if(!todo) {
		throw new Response("Resource not found", { status: 404 });
	}

	todo = Number(todo);

	if(Number.isNaN(todo)) {
		throw new Response("Resource not correct", { status: 400 });
	}

	try {
		const [result] = await db.query("SELECT id, title FROM todo_list WHERE id = ?", [todo])
		selectedTodo = result[0];
	} catch(error) {
		throw json({ success:false, message: error?.message || "Internal server error"}, { status: 500 }) 
	}

	return selectedTodo;
}

export default function AllProducts() {
	const todo = useLoaderData();
	const actionData = useActionData();

	return (
		<div>
			<Link to="/">Go Back</Link>
			<Form method="post">
				<input name="id" type="hidden" value={todo.id} />
				<input name="title" type="text" defaultValue={todo.title} />
				<button>Edit</button>

				<p>{actionData?.error?.title && actionData?.error.title}</p>
				<p>{actionData?.error?.id && actionData?.error.id}</p>
			</Form>
		</div>
	)
}

export async function action({request}) {
	const formData = await request.formData();
	const title = String(formData.get('title'));
	const id = Number(formData.get('id'));

	const error = {};
	// validation
	if(!title) {
		error.title = "Title is required.";
	}

	if(!id) {
		error.id = "Resource not found";
	}

	const hasError = +Object.keys(error)?.length;
	if(!!hasError) {
		return json({ success: false, error });
	}

	// commit to db
	try {
		await db.execute("UPDATE todo_list SET title = ? WHERE id = ?", [title.trim(), id])
	} catch(error) {
		throw json({ success:false, message: error?.message || "Internal server error"}, { status: 500 }) 
	}

	return redirect("/");
}