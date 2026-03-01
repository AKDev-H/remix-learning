import { Form, useActionData, useLoaderData, useNavigation, Outlet, Link } from '@remix-run/react';
import { json, redirect } from "@remix-run/node";
import { db } from "../../db"
import React from "react";

export async function loader() {
	let data = [];
	try {
		const [results] = await db.query('SELECT id, title, updated_at FROM todo_list ORDER BY created_at DESC');
		data = results;
	} catch(error) {
		throw json({ success:false, message: error?.message || "Internal server error"}, { status: 500 }) 
	}

	return json({success: true, data });
}

export default function Home() {
	const actionData = useActionData();
	const { data: todos } = useLoaderData();

	return(
		<div>
			<h1>Todo list</h1>
			<Form method="post">
				<input name="_method" value="post" type="hidden" />
				<input name="title" type="text" />
				{actionData?.error?.title && <span>{actionData?.error?.title}</span>}
				<button>Submit</button>
			</Form>

			{todos?.length > 0 && 
				<ul>
					{todos.map((t) => {
						return (
							<>
								<li key={t.id}>
									{t.title} 
									{t?.updated_at && (
										<>
											- {new Date(t.updated_at).toLocaleDateString()} <small>({new Date(t.updated_at).toLocaleTimeString()})</small>
										</>
									)}
									<Link to={`/todos/${t.id}/edit`}>Edit</Link>

									<Form method="post">
										<input name="_method" value="delete" type="hidden" />
										<input name="id" type="hidden" value={t.id} />
										<button>Delete</button>
									</Form>
								</li>
							</>
						)
					})}			
				</ul>
			}
		</div>
	)
}

export async function action({request}) {
	const formData = await request.formData();
	const requestMethodFromInput = formData.get("_method");

	if(requestMethodFromInput === "post") {
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
	}

	if(requestMethodFromInput === "delete") {
		const id = Number(formData.get("id"));
		
		if(!id) {
			throw new Response("Resource not found", { status: 404 });
		}

		try {
			await db.execute("DELETE FROM todo_list WHERE id = ?", [id]);
		} catch(error) {
			throw json({ success:false, message: error?.message || "Internal server error"}, { status: 500 }) 
		}
	}
	return redirect("/")
}
