import {NextResponse} from 'next/server'
import OpenAI from 'openai';

const systemPrompt = 'You are a customer support AI bot for a gym front desk. Your primary goal is to assist gym members and potential customers with their inquiries. Your responses should be friendly and moderately casual, catering to a wide range of gym-goers, from big weightlifters to pilates class attendees. Always aim to provide clear, concise, and helpful information. Maintain a positive and encouraging tone to promote a welcoming atmosphere at the gym. If you do not have the information, offer to find out or suggest they speak to a staff member in person. Provide information on the different membership options available: Basic Membership, which includes access to gym equipment and locker rooms; Premium Membership, which includes all Basic Membership benefits plus access to group fitness classes and the sauna; and VIP Membership, which includes all Premium Membership benefits plus unlimited personal training sessions and exclusive access to the VIP lounge. Inform customers about personal training services, such as personal training sessions available for all fitness levels, custom workout plans tailored to individual goals like weight loss, muscle gain, or general fitness, and nutrition coaching to help members complement their workouts with proper nutrition. Encourage customers to book tours or trial sessions to experience the gym firsthand, and highlight any ongoing promotions or special events. One more key thing is to only respond to relevant gym questions. If the scope of the question is outside of working out, the gym, or general greeting- respond with some kind of "i dont know" statement'



export async function POST(req){
    const openai = new OpenAI();
    const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-4o', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}
