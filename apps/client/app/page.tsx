export default function Home() {
	return (
		<div className="p-8">
			<main>
				<div>
					Home {process.env.NODE_ENV} {process.env.NEXT_PUBLIC_WS_CLIENT}
				</div>
			</main>
		</div>
	);
}
