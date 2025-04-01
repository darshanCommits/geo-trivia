export default function Loading() {
	console.log("it is loading")
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 ">
			<div className="text-center">
				<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4">
					<p className="text-xl font-medium text-gray-700">
						Loading questions...
					</p>
				</div>
			</div>
		</div>
	);
}
