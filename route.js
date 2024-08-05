import {NextResponse} from 'next/sever'
export default function POST(req){
    return NextResponse.json({message : 'from the server!'})
}