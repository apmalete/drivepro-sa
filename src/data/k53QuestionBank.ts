export type Question = {
  id: number;
  section: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

// Original, unofficial South African learner's-licence practice material.
export const QUESTION_BANK: Question[] = [
  {
    "id": 1,
    "section": "Rules of the Road",
    "question": "At a STOP sign with no traffic visible, what must you do?",
    "options": [
      "Slow down and roll through",
      "Stop completely, then proceed when safe",
      "Stop only if another vehicle arrives",
      "Hoot and continue"
    ],
    "answer": 1,
    "explanation": "A STOP sign requires a complete stop at the applicable stopping line or before entering the intersection."
  },
  {
    "id": 2,
    "section": "Rules of the Road",
    "question": "Where should you stop when a STOP line is marked?",
    "options": [
      "Beyond the line",
      "On the pedestrian crossing",
      "Before the line",
      "Beside the sign only"
    ],
    "answer": 2,
    "explanation": "Stop before the marked stopping line."
  },
  {
    "id": 3,
    "section": "Rules of the Road",
    "question": "You have stopped but cannot see cross-traffic clearly. What should you do?",
    "options": [
      "Edge forward cautiously when safe and continue yielding",
      "Accelerate without checking",
      "Assume other traffic must stop",
      "Follow the vehicle ahead blindly"
    ],
    "answer": 0,
    "explanation": "After stopping, improve visibility cautiously without entering the path of traffic with priority."
  },
  {
    "id": 4,
    "section": "Rules of the Road",
    "question": "A driver behind you hoots at a STOP sign. What should you do?",
    "options": [
      "Ignore the sign",
      "Stop halfway",
      "Proceed because they are impatient",
      "Complete the stop and proceed only when safe"
    ],
    "answer": 3,
    "explanation": "Pressure from other drivers does not cancel a STOP sign."
  },
  {
    "id": 5,
    "section": "Rules of the Road",
    "question": "What is the safest approach to a STOP-controlled intersection?",
    "options": [
      "Look only one way",
      "Stop fully, observe all directions and proceed when safe",
      "Follow the car in front without stopping",
      "Use the horn instead of stopping"
    ],
    "answer": 1,
    "explanation": "Stop completely and check for traffic and pedestrians before proceeding."
  },
  {
    "id": 6,
    "section": "Rules of the Road",
    "question": "At a YIELD sign, traffic on the intersecting road has priority. What should you do?",
    "options": [
      "Maintain speed",
      "Give way and stop if necessary",
      "Expect the other traffic to stop",
      "Enter first to claim priority"
    ],
    "answer": 1,
    "explanation": "Reduce speed and yield to traffic with priority; stop if needed."
  },
  {
    "id": 7,
    "section": "Rules of the Road",
    "question": "No traffic is approaching a YIELD sign. What is appropriate?",
    "options": [
      "Always stop for ten seconds",
      "Close your eyes and listen",
      "Proceed cautiously when safe",
      "Accelerate without checking"
    ],
    "answer": 2,
    "explanation": "A yield sign does not always require a full stop, but you must give way when necessary."
  },
  {
    "id": 8,
    "section": "Rules of the Road",
    "question": "You are entering a main road from a road marked YIELD. Who should you yield to?",
    "options": [
      "Only trucks",
      "Only traffic behind you",
      "No one if you signal",
      "Traffic on the road you are entering that has priority"
    ],
    "answer": 3,
    "explanation": "Give way to traffic that has priority on the road you intend to enter."
  },
  {
    "id": 9,
    "section": "Rules of the Road",
    "question": "A vehicle approaches on the priority road. What should you do?",
    "options": [
      "Race ahead",
      "Wait or slow down to let it pass",
      "Hoot continuously",
      "Move across because you arrived first"
    ],
    "answer": 1,
    "explanation": "Do not force priority traffic to brake or swerve."
  },
  {
    "id": 10,
    "section": "Rules of the Road",
    "question": "Which statement best describes a YIELD sign?",
    "options": [
      "Give way and stop if necessary",
      "Always stop for a fixed time",
      "It gives you priority",
      "It applies only to trucks"
    ],
    "answer": 0,
    "explanation": "A yield sign requires you to give way; stop if that is necessary."
  },
  {
    "id": 11,
    "section": "Rules of the Road",
    "question": "A red traffic light faces you. What must you do?",
    "options": [
      "Proceed if the road looks empty",
      "Drive slowly through",
      "Stop at the applicable stopping line",
      "Hoot and continue"
    ],
    "answer": 2,
    "explanation": "A red traffic signal requires you to stop at the applicable stopping line."
  },
  {
    "id": 12,
    "section": "Rules of the Road",
    "question": "A signal changes to amber as you approach. What should you do?",
    "options": [
      "Accelerate in every case",
      "Reverse",
      "Ignore it",
      "Stop if you can do so safely"
    ],
    "answer": 3,
    "explanation": "Amber warns that the signal is changing; stop if it is safe to do so."
  },
  {
    "id": 13,
    "section": "Rules of the Road",
    "question": "The light is green but traffic beyond the intersection is blocked. What should you do?",
    "options": [
      "Enter and wait in the intersection",
      "Wait until you can clear the intersection",
      "Hoot until traffic moves",
      "Follow the car ahead regardless"
    ],
    "answer": 1,
    "explanation": "Do not enter an intersection if you cannot clear it safely."
  },
  {
    "id": 14,
    "section": "Rules of the Road",
    "question": "Traffic signals are not working. What is safest?",
    "options": [
      "Slow down, observe signs and other traffic, and proceed cautiously",
      "Assume you have priority",
      "Drive through at normal speed",
      "Follow the vehicle ahead without looking"
    ],
    "answer": 0,
    "explanation": "A malfunctioning signal requires caution and compliance with any other controls."
  },
  {
    "id": 15,
    "section": "Rules of the Road",
    "question": "You have a green signal to turn but pedestrians are in your path. What should you do?",
    "options": [
      "Drive around them closely",
      "Hoot and accelerate",
      "Wait and allow them to clear safely",
      "Turn without looking"
    ],
    "answer": 2,
    "explanation": "A green signal does not permit you to endanger pedestrians in your path."
  },
  {
    "id": 16,
    "section": "Rules of the Road",
    "question": "Before changing lanes, what checks should you make?",
    "options": [
      "Signal after moving",
      "Look only straight ahead",
      "Brake sharply",
      "Check mirrors and blind spots, signal and move only when safe"
    ],
    "answer": 3,
    "explanation": "Check mirrors and blind spots, signal in good time and move only when safe."
  },
  {
    "id": 17,
    "section": "Rules of the Road",
    "question": "A vehicle is in your blind spot. What should you do?",
    "options": [
      "Move because you signalled",
      "Stay in your lane until the manoeuvre is safe",
      "Speed up and squeeze in",
      "Hoot and move"
    ],
    "answer": 1,
    "explanation": "A signal communicates intention but does not give you priority."
  },
  {
    "id": 18,
    "section": "Rules of the Road",
    "question": "Why is a mirror check alone not always enough?",
    "options": [
      "Mirrors are illegal",
      "Mirrors show only the front",
      "Some road users may be in blind spots",
      "Mirrors measure speed"
    ],
    "answer": 2,
    "explanation": "Blind-spot checks help detect road users not visible in mirrors."
  },
  {
    "id": 19,
    "section": "Rules of the Road",
    "question": "When should you signal a lane change?",
    "options": [
      "In good time before moving",
      "Only after crossing the line",
      "Only if someone hoots",
      "After completing it"
    ],
    "answer": 0,
    "explanation": "Signal in good time so others can understand your intention."
  },
  {
    "id": 20,
    "section": "Rules of the Road",
    "question": "Another vehicle is moving into the lane you want. What is safest?",
    "options": [
      "Force your way in",
      "Drive on the shoulder",
      "Hoot and squeeze past",
      "Wait for a safe gap"
    ],
    "answer": 3,
    "explanation": "Avoid competing for the same space; wait until the manoeuvre is safe."
  },
  {
    "id": 21,
    "section": "Rules of the Road",
    "question": "Why maintain a safe following distance?",
    "options": [
      "To stop others overtaking",
      "To allow time to react and stop",
      "To keep headlights hidden",
      "To save time at intersections"
    ],
    "answer": 1,
    "explanation": "A safe gap gives you time and distance to respond to hazards."
  },
  {
    "id": 22,
    "section": "Rules of the Road",
    "question": "The road is wet. How should you adjust your following distance?",
    "options": [
      "Reduce it",
      "Follow closer",
      "Increase it",
      "Keep it unchanged regardless"
    ],
    "answer": 2,
    "explanation": "Wet surfaces can increase stopping distance, so leave more space."
  },
  {
    "id": 23,
    "section": "Rules of the Road",
    "question": "A vehicle ahead brakes suddenly. What helps you avoid a collision?",
    "options": [
      "Driving close behind it",
      "Hooting instead of braking",
      "Looking only at its number plate",
      "Leaving enough space and scanning ahead"
    ],
    "answer": 3,
    "explanation": "A safe gap and attention to the road ahead help you respond."
  },
  {
    "id": 24,
    "section": "Rules of the Road",
    "question": "A truck blocks your view ahead. What should you do?",
    "options": [
      "Increase the gap to improve visibility and reaction time",
      "Follow very closely",
      "Overtake immediately anywhere",
      "Switch off headlights"
    ],
    "answer": 0,
    "explanation": "A larger gap can improve your view and give you more time to react."
  },
  {
    "id": 25,
    "section": "Rules of the Road",
    "question": "Visibility is poor at night. What should you do?",
    "options": [
      "Drive closer to the vehicle ahead",
      "Reduce speed and increase following distance",
      "Use high beam toward oncoming traffic",
      "Ignore conditions"
    ],
    "answer": 1,
    "explanation": "Lower visibility calls for slower speeds and more space."
  },
  {
    "id": 26,
    "section": "Rules of the Road",
    "question": "Before overtaking, what must you establish?",
    "options": [
      "That the vehicle ahead is slow",
      "That you can exceed the speed limit",
      "That the manoeuvre is legal and there is enough clear space",
      "That you can hoot loudly"
    ],
    "answer": 2,
    "explanation": "Overtake only when permitted and when you can complete the manoeuvre safely."
  },
  {
    "id": 27,
    "section": "Rules of the Road",
    "question": "You approach a crest and cannot see the road ahead. Should you overtake?",
    "options": [
      "Yes, if you accelerate",
      "Yes, if you hoot",
      "Yes, if the vehicle is slow",
      "No, visibility is insufficient to ensure safety"
    ],
    "answer": 3,
    "explanation": "Do not overtake when you cannot see enough road to complete the manoeuvre safely."
  },
  {
    "id": 28,
    "section": "Rules of the Road",
    "question": "The vehicle ahead signals right. What should you do?",
    "options": [
      "Pass without checking",
      "Assess its likely movement and wait until passing is safe and lawful",
      "Drive onto the pavement",
      "Force past with your horn"
    ],
    "answer": 1,
    "explanation": "A vehicle signalling right may be turning; do not pass until it is safe and lawful."
  },
  {
    "id": 29,
    "section": "Rules of the Road",
    "question": "An oncoming vehicle appears while you are overtaking. What should you do?",
    "options": [
      "Abort the manoeuvre if possible and return safely to your lane",
      "Accelerate regardless",
      "Swerve onto the pavement",
      "Close your eyes"
    ],
    "answer": 0,
    "explanation": "Avoid a head-on collision and return to your lane when safe."
  },
  {
    "id": 30,
    "section": "Rules of the Road",
    "question": "Before moving back after overtaking, what should you check?",
    "options": [
      "Only the fuel gauge",
      "Only whether the road is straight",
      "That you have cleared the vehicle and can return safely",
      "That your horn works"
    ],
    "answer": 2,
    "explanation": "Check there is enough space before returning to your lane."
  },
  {
    "id": 31,
    "section": "Rules of the Road",
    "question": "Pedestrians are crossing in front of you. What should you do?",
    "options": [
      "Hoot and continue",
      "Drive around them closely",
      "Accelerate",
      "Slow down or stop as needed to let them cross safely"
    ],
    "answer": 3,
    "explanation": "Approach crossings cautiously and do not endanger pedestrians."
  },
  {
    "id": 32,
    "section": "Rules of the Road",
    "question": "Why be especially careful near schools?",
    "options": [
      "School roads have no rules",
      "Children may move unexpectedly and be difficult to see",
      "Children always hear a horn",
      "Speed limits do not apply"
    ],
    "answer": 1,
    "explanation": "Children can move unexpectedly; reduce speed and watch carefully."
  },
  {
    "id": 33,
    "section": "Rules of the Road",
    "question": "A pedestrian is near the road at night. What should you do?",
    "options": [
      "Assume they will stay there",
      "Drive faster",
      "Reduce speed if needed and be prepared for movement",
      "Look away"
    ],
    "answer": 2,
    "explanation": "Pedestrians can be hard to see at night; stay alert."
  },
  {
    "id": 34,
    "section": "Rules of the Road",
    "question": "A vehicle is stopped near a pedestrian crossing. What should you do?",
    "options": [
      "Overtake immediately",
      "Hoot and pass",
      "Drive onto the pavement",
      "Slow down and check for pedestrians before proceeding"
    ],
    "answer": 3,
    "explanation": "A stopped vehicle may be yielding to pedestrians you cannot see."
  },
  {
    "id": 35,
    "section": "Rules of the Road",
    "question": "Why should you avoid parking on a pedestrian pavement?",
    "options": [
      "It obstructs pedestrian movement and may be unlawful",
      "It improves visibility",
      "It creates a safe overtaking lane",
      "It is required"
    ],
    "answer": 0,
    "explanation": "Keep pedestrian routes clear and comply with parking rules."
  },
  {
    "id": 36,
    "section": "Rules of the Road",
    "question": "An emergency vehicle approaches with warning signals operating. What should you do?",
    "options": [
      "Race ahead",
      "Give way safely and make a clear passage where possible",
      "Stop in the middle of an intersection",
      "Follow closely"
    ],
    "answer": 1,
    "explanation": "Give way safely without creating another hazard."
  },
  {
    "id": 37,
    "section": "Rules of the Road",
    "question": "Why should you not follow closely behind an ambulance responding to an emergency?",
    "options": [
      "It saves no fuel",
      "It improves visibility",
      "It can obstruct the response and create a collision risk",
      "It is required"
    ],
    "answer": 2,
    "explanation": "Do not exploit an emergency vehicle's passage or follow dangerously close."
  },
  {
    "id": 38,
    "section": "Rules of the Road",
    "question": "You hear a siren but cannot identify its direction. What should you do?",
    "options": [
      "Accelerate",
      "Stop in any lane immediately",
      "Ignore it",
      "Stay alert, check surroundings and prepare to give way safely"
    ],
    "answer": 3,
    "explanation": "Locate the emergency vehicle carefully and avoid sudden unsafe manoeuvres."
  },
  {
    "id": 39,
    "section": "Rules of the Road",
    "question": "An emergency vehicle approaches while you are in an intersection. What should you avoid?",
    "options": [
      "A sudden move that creates a collision risk",
      "Checking mirrors",
      "Giving way when safe",
      "Maintaining awareness"
    ],
    "answer": 0,
    "explanation": "Make room safely; do not create a new hazard by moving unpredictably."
  },
  {
    "id": 40,
    "section": "Rules of the Road",
    "question": "After an emergency vehicle passes, what should you do?",
    "options": [
      "Follow it at speed",
      "Resume only when safe and obey traffic controls",
      "Assume all traffic has stopped",
      "Drive without checking"
    ],
    "answer": 1,
    "explanation": "Check that it is safe before continuing."
  },
  {
    "id": 41,
    "section": "Rules of the Road",
    "question": "Heavy rain begins. What should you do?",
    "options": [
      "Maintain speed",
      "Brake hard repeatedly",
      "Reduce speed, increase distance and use lights as required",
      "Follow closely"
    ],
    "answer": 2,
    "explanation": "Rain reduces grip and visibility; adapt speed and spacing."
  },
  {
    "id": 42,
    "section": "Rules of the Road",
    "question": "Fog reduces visibility. Which action is safest?",
    "options": [
      "Use high beam continuously",
      "Drive faster",
      "Stop in a live lane",
      "Reduce speed and use appropriate lights"
    ],
    "answer": 3,
    "explanation": "Drive at a speed that allows you to stop within the visible clear distance."
  },
  {
    "id": 43,
    "section": "Rules of the Road",
    "question": "Floodwater covers the road and its depth is unclear. What should you do?",
    "options": [
      "Do not enter if safety is uncertain; find another route",
      "Drive through at speed",
      "Follow a truck closely",
      "Accelerate to splash through"
    ],
    "answer": 0,
    "explanation": "Floodwater depth and current can be deceptive."
  },
  {
    "id": 44,
    "section": "Rules of the Road",
    "question": "Strong crosswinds affect your vehicle. What should you do?",
    "options": [
      "Release the steering wheel",
      "Grip the wheel firmly, reduce speed and allow extra space",
      "Brake sharply",
      "Drive beside a truck for shelter"
    ],
    "answer": 1,
    "explanation": "Wind can push a vehicle sideways; maintain control."
  },
  {
    "id": 45,
    "section": "Rules of the Road",
    "question": "Sun glare makes it difficult to see. What should you do?",
    "options": [
      "Look directly at the sun",
      "Accelerate",
      "Reduce speed until visibility improves",
      "Switch off wipers in rain"
    ],
    "answer": 2,
    "explanation": "Slow down and use the sun visor or clean windscreen as appropriate."
  },
  {
    "id": 46,
    "section": "Rules of the Road",
    "question": "How can alcohol affect driving?",
    "options": [
      "It improves judgement",
      "It guarantees faster reactions",
      "It improves night vision",
      "It can impair judgement, coordination and reaction time"
    ],
    "answer": 3,
    "explanation": "Alcohol impairs skills needed for safe driving."
  },
  {
    "id": 47,
    "section": "Rules of the Road",
    "question": "You feel sleepy and struggle to concentrate. What should you do?",
    "options": [
      "Stop at a safe place and rest or arrange another driver",
      "Open a window and continue indefinitely",
      "Drive faster",
      "Ignore it"
    ],
    "answer": 0,
    "explanation": "Fatigue can severely impair driving; stop safely and rest."
  },
  {
    "id": 48,
    "section": "Rules of the Road",
    "question": "Why is driving after drinking dangerous even if you feel normal?",
    "options": [
      "Alcohol only affects passengers",
      "You may underestimate impairment and still have slower reactions",
      "Coffee cancels alcohol immediately",
      "It improves hazard perception"
    ],
    "answer": 1,
    "explanation": "Feeling normal does not mean your driving ability is unaffected."
  },
  {
    "id": 49,
    "section": "Rules of the Road",
    "question": "Medicine warns that it may cause drowsiness. What should you do?",
    "options": [
      "Drive as usual",
      "Take extra doses",
      "Check the warning and avoid driving if impaired",
      "Drink alcohol to counter it"
    ],
    "answer": 2,
    "explanation": "Some medicines affect alertness; follow the label and professional advice."
  },
  {
    "id": 50,
    "section": "Rules of the Road",
    "question": "Your attention is fading after a long shift. What is safer?",
    "options": [
      "Keep driving because you are nearly home",
      "Drive close behind another vehicle",
      "Use your phone to stay awake",
      "Take a safe break before continuing"
    ],
    "answer": 3,
    "explanation": "A safe rest is better than continuing while fatigued."
  },
  {
    "id": 51,
    "section": "Rules of the Road",
    "question": "Who should use a seat belt where fitted and required?",
    "options": [
      "Only the driver",
      "The driver and passengers as required by law",
      "Only front passengers",
      "Only on long trips"
    ],
    "answer": 1,
    "explanation": "Seat belts reduce injury risk and must be used as required."
  },
  {
    "id": 52,
    "section": "Rules of the Road",
    "question": "What should you ensure for child passengers before moving off?",
    "options": [
      "They hold the dashboard",
      "They stand between seats",
      "They are secured in an appropriate restraint as required",
      "They sit on the driver's lap"
    ],
    "answer": 2,
    "explanation": "Use an appropriate child restraint and comply with legal requirements."
  },
  {
    "id": 53,
    "section": "Rules of the Road",
    "question": "Why should passengers avoid distracting the driver?",
    "options": [
      "It improves fuel use",
      "It improves reaction time",
      "It replaces mirrors",
      "Distraction reduces attention to hazards"
    ],
    "answer": 3,
    "explanation": "The driver needs attention for safe control and hazard detection."
  },
  {
    "id": 54,
    "section": "Rules of the Road",
    "question": "A passenger refuses a required seat belt. What should you do?",
    "options": [
      "Do not start until the safety requirement is met",
      "Drive anyway",
      "Ask them to hold the door",
      "Drive slowly and ignore it"
    ],
    "answer": 0,
    "explanation": "Ensure required restraints are used before moving."
  },
  {
    "id": 55,
    "section": "Rules of the Road",
    "question": "Why avoid carrying more passengers than the vehicle is designed or permitted for?",
    "options": [
      "It always saves fuel",
      "It can compromise safety and breach legal limits",
      "It improves braking",
      "It makes steering easier"
    ],
    "answer": 1,
    "explanation": "Overloading can affect control, restraints and legal compliance."
  },
  {
    "id": 56,
    "section": "Rules of the Road",
    "question": "Where should you avoid stopping or parking?",
    "options": [
      "Only at night",
      "Anywhere if hazard lights are on",
      "Where prohibited or where you obstruct or endanger others",
      "Only in a driveway"
    ],
    "answer": 2,
    "explanation": "Obey parking restrictions and do not create an obstruction or danger."
  },
  {
    "id": 57,
    "section": "Rules of the Road",
    "question": "Your vehicle breaks down. What should you do?",
    "options": [
      "Leave it in a live lane without warning",
      "Stand behind it in traffic",
      "Switch off warning devices",
      "Stop as safely as possible and warn other road users"
    ],
    "answer": 3,
    "explanation": "Move to safety if possible and warn other road users."
  },
  {
    "id": 58,
    "section": "Rules of the Road",
    "question": "Why should you not park across a driveway without permission?",
    "options": [
      "It obstructs access and may be unlawful",
      "It improves visibility",
      "It is allowed everywhere for five minutes",
      "It prevents theft"
    ],
    "answer": 0,
    "explanation": "Do not block access or violate parking rules."
  },
  {
    "id": 59,
    "section": "Rules of the Road",
    "question": "When parking on a slope, what should you do?",
    "options": [
      "Leave it in neutral without a brake",
      "Secure it with the parking brake and appropriate gear or park position",
      "Leave the door open",
      "Ignore the slope"
    ],
    "answer": 1,
    "explanation": "Secure the vehicle so it cannot roll."
  },
  {
    "id": 60,
    "section": "Rules of the Road",
    "question": "Do hazard lights make prohibited parking lawful?",
    "options": [
      "Yes, always",
      "Only in daylight",
      "No, hazard lights do not cancel parking rules",
      "Only if the driver stays inside"
    ],
    "answer": 2,
    "explanation": "Warning lights do not grant permission to park where prohibited."
  },
  {
    "id": 61,
    "section": "Rules of the Road",
    "question": "What does an indicator communicate?",
    "options": [
      "A guaranteed right of way",
      "That you checked the blind spot",
      "That the road is closed",
      "Your intended direction, not an automatic right of way"
    ],
    "answer": 3,
    "explanation": "Signals communicate intention; the manoeuvre must still be safe."
  },
  {
    "id": 62,
    "section": "Rules of the Road",
    "question": "Your indicator remains on after a turn. What should you do?",
    "options": [
      "Cancel it when appropriate so others are not misled",
      "Continue with it on",
      "Use the horn instead",
      "Drive faster"
    ],
    "answer": 0,
    "explanation": "Cancel a signal when the manoeuvre is complete."
  },
  {
    "id": 63,
    "section": "Rules of the Road",
    "question": "When should you signal before turning?",
    "options": [
      "Only after turning",
      "In good time before the manoeuvre",
      "Only at night",
      "Only when someone is behind"
    ],
    "answer": 1,
    "explanation": "Signal early enough to communicate your intention clearly."
  },
  {
    "id": 64,
    "section": "Rules of the Road",
    "question": "A driver signals left but continues straight. What should you do?",
    "options": [
      "Move in front immediately",
      "Assume all signals are correct",
      "Observe actual movement and proceed cautiously",
      "Close the gap"
    ],
    "answer": 2,
    "explanation": "Watch vehicle movement as well as signals."
  },
  {
    "id": 65,
    "section": "Rules of the Road",
    "question": "Does signalling replace checking traffic?",
    "options": [
      "Yes",
      "Only on dry roads",
      "Only if you hoot",
      "No, you must still observe and ensure the manoeuvre is safe"
    ],
    "answer": 3,
    "explanation": "A signal does not replace observation or safe driving."
  },
  {
    "id": 66,
    "section": "Rules of the Road",
    "question": "What should determine your speed?",
    "options": [
      "The limit plus conditions, hazards and visibility",
      "Only the speed of the vehicle behind",
      "Only engine size",
      "Only the posted maximum regardless of conditions"
    ],
    "answer": 0,
    "explanation": "A posted limit is not always a safe target speed."
  },
  {
    "id": 67,
    "section": "Rules of the Road",
    "question": "When should you reduce speed for a sharp bend?",
    "options": [
      "Only after entering",
      "Before the bend",
      "Only if another vehicle is there",
      "After accelerating through it"
    ],
    "answer": 1,
    "explanation": "Reduce speed before the bend and maintain control."
  },
  {
    "id": 68,
    "section": "Rules of the Road",
    "question": "Why can driving below the posted limit still be too fast?",
    "options": [
      "Road rules no longer apply",
      "It always shortens stopping distance",
      "Conditions may require a lower safe speed",
      "It improves grip"
    ],
    "answer": 2,
    "explanation": "Rain, traffic or poor visibility may require a speed below the legal maximum."
  },
  {
    "id": 69,
    "section": "Rules of the Road",
    "question": "Your vehicle begins to skid. What should you avoid?",
    "options": [
      "Staying calm",
      "Looking where you want to go",
      "Smooth control inputs",
      "Sudden harsh braking or steering"
    ],
    "answer": 3,
    "explanation": "Abrupt inputs can worsen a skid; follow safe vehicle-control guidance."
  },
  {
    "id": 70,
    "section": "Rules of the Road",
    "question": "A narrow road has parked vehicles. What should you do?",
    "options": [
      "Reduce speed and be ready to stop for oncoming traffic or people",
      "Drive down the middle at speed",
      "Use the pavement",
      "Hoot and accelerate"
    ],
    "answer": 0,
    "explanation": "Narrow roads and parked vehicles create hazards."
  },
  {
    "id": 71,
    "section": "Rules of the Road",
    "question": "What is safest regarding a handheld phone while driving?",
    "options": [
      "Read messages at red lights",
      "Do not handle it while driving; stop safely if needed",
      "Hold it below the wheel",
      "Use it on straight roads"
    ],
    "answer": 1,
    "explanation": "Phone use distracts drivers and handheld use is restricted by law."
  },
  {
    "id": 72,
    "section": "Rules of the Road",
    "question": "You need to adjust navigation. What should you do?",
    "options": [
      "Type while driving slowly",
      "Look down at each instruction",
      "Set it before moving or stop safely to adjust it",
      "Hold it in front of your eyes"
    ],
    "answer": 2,
    "explanation": "Set navigation before driving and avoid interacting with it while moving."
  },
  {
    "id": 73,
    "section": "Rules of the Road",
    "question": "Why is eating while driving risky?",
    "options": [
      "It improves focus",
      "It shortens braking distance",
      "It replaces rest",
      "It can take hands, eyes or attention away from driving"
    ],
    "answer": 3,
    "explanation": "Keep attention and control available for driving."
  },
  {
    "id": 74,
    "section": "Rules of the Road",
    "question": "A passenger shows you a video while driving. What should you do?",
    "options": [
      "Keep attention on the road and ask them to wait until stopped",
      "Watch it briefly",
      "Turn toward the passenger",
      "Accelerate"
    ],
    "answer": 0,
    "explanation": "Visual and mental distractions can delay responses."
  },
  {
    "id": 75,
    "section": "Rules of the Road",
    "question": "You need to make an urgent call. What is safer?",
    "options": [
      "Call while turning",
      "Find a safe legal place to stop first",
      "Text at a traffic light",
      "Use the phone at speed"
    ],
    "answer": 1,
    "explanation": "Stop safely and legally before handling a phone."
  },
  {
    "id": 76,
    "section": "Rules of the Road",
    "question": "You see roadworks and workers ahead. What should you do?",
    "options": [
      "Ignore signs if no cones are visible",
      "Accelerate through",
      "Reduce speed and follow temporary signs and directions",
      "Drive around signs"
    ],
    "answer": 2,
    "explanation": "Temporary controls protect workers and road users."
  },
  {
    "id": 77,
    "section": "Rules of the Road",
    "question": "A traffic controller directs vehicles through roadworks. What should you do?",
    "options": [
      "Ignore them if the light is green",
      "Race another vehicle",
      "Drive over cones",
      "Follow lawful directions and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Follow authorised traffic-control directions and temporary signs."
  },
  {
    "id": 78,
    "section": "Rules of the Road",
    "question": "Why leave extra space near roadworks?",
    "options": [
      "Workers, machinery and sudden stops may be present",
      "It guarantees priority",
      "It permits speeding",
      "It helps overtake on the shoulder"
    ],
    "answer": 0,
    "explanation": "Roadworks involve changing conditions and unexpected hazards."
  },
  {
    "id": 79,
    "section": "Rules of the Road",
    "question": "Cones guide traffic into a narrower lane. What should you avoid?",
    "options": [
      "Checking mirrors",
      "Last-second swerving across lanes",
      "Reducing speed",
      "Leaving space"
    ],
    "answer": 1,
    "explanation": "Merge smoothly when safe and respect temporary markings."
  },
  {
    "id": 80,
    "section": "Rules of the Road",
    "question": "Loose gravel is present at roadworks. What should you do?",
    "options": [
      "Brake sharply",
      "Accelerate hard",
      "Reduce speed and avoid abrupt braking or steering",
      "Follow closely"
    ],
    "answer": 2,
    "explanation": "Loose surfaces reduce grip; use smooth control inputs."
  },
  {
    "id": 81,
    "section": "Rules of the Road",
    "question": "Red warning lights flash or a barrier is lowered at a railway crossing. What should you do?",
    "options": [
      "Drive around the barrier",
      "Follow a motorcycle around it",
      "Hoot and cross",
      "Stop and wait until signals permit crossing"
    ],
    "answer": 3,
    "explanation": "Never cross against active warning signals or a lowered barrier."
  },
  {
    "id": 82,
    "section": "Rules of the Road",
    "question": "Traffic is backed up beyond the railway crossing. What should you do?",
    "options": [
      "Wait until there is room to clear the tracks completely",
      "Enter to claim space",
      "Follow the car ahead",
      "Stop on the tracks"
    ],
    "answer": 0,
    "explanation": "Do not enter unless you can clear the crossing."
  },
  {
    "id": 83,
    "section": "Rules of the Road",
    "question": "A train is approaching. What should you do?",
    "options": [
      "Race across",
      "Stop and wait",
      "Drive around a closed gate",
      "Follow another vehicle through"
    ],
    "answer": 1,
    "explanation": "Trains need a long distance to stop; wait for the crossing to be safe."
  },
  {
    "id": 84,
    "section": "Rules of the Road",
    "question": "The train has passed but warning lights remain active. What should you do?",
    "options": [
      "Drive through quickly",
      "Move the barrier",
      "Continue waiting until warnings stop and crossing is safe",
      "Follow a pedestrian"
    ],
    "answer": 2,
    "explanation": "Do not cross while warnings remain active."
  },
  {
    "id": 85,
    "section": "Rules of the Road",
    "question": "Why must you avoid stopping on railway tracks?",
    "options": [
      "It improves visibility",
      "Trains can swerve around cars",
      "It is a safe waiting area",
      "A train may not be able to stop in time"
    ],
    "answer": 3,
    "explanation": "A train cannot stop quickly enough to avoid a vehicle on the tracks."
  },
  {
    "id": 86,
    "section": "Rules of the Road",
    "question": "When passing a cyclist, what should you do?",
    "options": [
      "Allow ample safe clearance and pass only when lawful",
      "Pass as close as possible",
      "Force them off the road",
      "Hoot continuously"
    ],
    "answer": 0,
    "explanation": "Cyclists are vulnerable road users; leave adequate clearance."
  },
  {
    "id": 87,
    "section": "Rules of the Road",
    "question": "Why check for cyclists before opening a vehicle door?",
    "options": [
      "Cyclists always stop",
      "A cyclist may be approaching from behind",
      "It changes the speed limit",
      "It checks fuel"
    ],
    "answer": 1,
    "explanation": "Check mirrors and surroundings before opening a door into traffic."
  },
  {
    "id": 88,
    "section": "Rules of the Road",
    "question": "Why check blind spots for motorcycles?",
    "options": [
      "They never use lanes",
      "They cannot overtake",
      "Their smaller size can make them harder to notice",
      "They are always easy to see"
    ],
    "answer": 2,
    "explanation": "Motorcycles may be less visible, so check carefully."
  },
  {
    "id": 89,
    "section": "Rules of the Road",
    "question": "A motorcycle approaches in your mirror. What should you do before changing lanes?",
    "options": [
      "Move because cars have priority",
      "Signal and move immediately",
      "Hoot and force it to brake",
      "Wait until the lane change is safe and the motorcycle is clear"
    ],
    "answer": 3,
    "explanation": "Avoid cutting off a motorcycle; signals do not grant priority."
  },
  {
    "id": 90,
    "section": "Rules of the Road",
    "question": "Rain begins and a motorcycle is ahead. What should you remember?",
    "options": [
      "Wet surfaces can reduce grip for motorcycles and other vehicles",
      "It cannot slip",
      "It always stops faster",
      "It must use the pavement"
    ],
    "answer": 0,
    "explanation": "Wet conditions affect grip for all road users."
  },
  {
    "id": 91,
    "section": "Rules of the Road",
    "question": "When should you use the hooter?",
    "options": [
      "To demand priority",
      "When reasonably necessary to warn of danger, in accordance with the rules",
      "At every traffic light",
      "To express anger at every delay"
    ],
    "answer": 1,
    "explanation": "The horn is a warning device, not a way to claim priority."
  },
  {
    "id": 92,
    "section": "Rules of the Road",
    "question": "What should you do with high beams for oncoming traffic when required?",
    "options": [
      "Keep them on regardless",
      "Flash continuously",
      "Dip them to avoid dazzling other road users",
      "Switch off all lights"
    ],
    "answer": 2,
    "explanation": "Avoid dazzling oncoming drivers and comply with lighting rules."
  },
  {
    "id": 93,
    "section": "Rules of the Road",
    "question": "Why keep headlights clean and working?",
    "options": [
      "They improve engine power",
      "They replace brakes",
      "They guarantee priority",
      "They help you see and be seen"
    ],
    "answer": 3,
    "explanation": "Working, clean lights improve visibility."
  },
  {
    "id": 94,
    "section": "Rules of the Road",
    "question": "You are dazzled by oncoming headlights. What should you do?",
    "options": [
      "Reduce speed, avoid staring into the lights and keep control",
      "Look directly at the lights",
      "Accelerate",
      "Close your eyes"
    ],
    "answer": 0,
    "explanation": "Do not stare into glare; reduce speed if needed."
  },
  {
    "id": 95,
    "section": "Rules of the Road",
    "question": "When should lights be used in poor visibility?",
    "options": [
      "Only on empty roads",
      "When conditions or law require them so you can see and be seen",
      "Never in daylight",
      "Only when speeding"
    ],
    "answer": 1,
    "explanation": "Use appropriate lights when visibility is poor and as required."
  },
  {
    "id": 96,
    "section": "Rules of the Road",
    "question": "A solid line prohibits crossing for your direction. What should you do?",
    "options": [
      "Cross whenever you want",
      "Drive along the line",
      "Obey the restriction and do not cross unlawfully",
      "Use the shoulder"
    ],
    "answer": 2,
    "explanation": "Road markings regulate lane use and overtaking."
  },
  {
    "id": 97,
    "section": "Rules of the Road",
    "question": "A lane arrow indicates left turn only. What should you do?",
    "options": [
      "Continue straight regardless",
      "Turn right",
      "Stop in the intersection",
      "Use the lane for the indicated movement"
    ],
    "answer": 3,
    "explanation": "Lane arrows indicate permitted or required direction."
  },
  {
    "id": 98,
    "section": "Rules of the Road",
    "question": "You see a pedestrian crossing marked on the road. What should you do?",
    "options": [
      "Approach cautiously and watch for pedestrians",
      "Park on it",
      "Overtake a stopped vehicle on it",
      "Accelerate without checking"
    ],
    "answer": 0,
    "explanation": "Crossing markings alert drivers to a pedestrian crossing."
  },
  {
    "id": 99,
    "section": "Rules of the Road",
    "question": "Where should you stop on red when a stop line is marked?",
    "options": [
      "Past the crossing",
      "Before the stop line",
      "In the middle of the junction",
      "Anywhere in the intersection"
    ],
    "answer": 1,
    "explanation": "Stop before the marked line when required by the signal."
  },
  {
    "id": 100,
    "section": "Rules of the Road",
    "question": "Temporary road markings change the lane path at roadworks. What should you do?",
    "options": [
      "Ignore them",
      "Drive between cones",
      "Follow temporary traffic arrangements and signs",
      "Use any lane at speed"
    ],
    "answer": 2,
    "explanation": "Follow the current temporary layout."
  },
  {
    "id": 101,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a STOP sign?",
    "options": [
      "STOP",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Come to a complete stop and proceed only when safe."
  },
  {
    "id": 102,
    "section": "Road Traffic Signs",
    "question": "You see a STOP sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Come to a complete stop and proceed only when safe."
  },
  {
    "id": 103,
    "section": "Road Traffic Signs",
    "question": "Which statement about a STOP sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "STOP",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Come to a complete stop and proceed only when safe."
  },
  {
    "id": 104,
    "section": "Road Traffic Signs",
    "question": "A STOP sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Come to a complete stop and proceed only when safe."
  },
  {
    "id": 105,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a STOP sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Come to a complete stop and proceed only when safe."
  },
  {
    "id": 106,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a YIELD sign?",
    "options": [
      "YIELD",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Give way to traffic with priority and stop if necessary."
  },
  {
    "id": 107,
    "section": "Road Traffic Signs",
    "question": "You see a YIELD sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Give way to traffic with priority and stop if necessary."
  },
  {
    "id": 108,
    "section": "Road Traffic Signs",
    "question": "Which statement about a YIELD sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "YIELD",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Give way to traffic with priority and stop if necessary."
  },
  {
    "id": 109,
    "section": "Road Traffic Signs",
    "question": "A YIELD sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Give way to traffic with priority and stop if necessary."
  },
  {
    "id": 110,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a YIELD sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Give way to traffic with priority and stop if necessary."
  },
  {
    "id": 111,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a No entry sign?",
    "options": [
      "NO ENTRY",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Do not enter from that direction."
  },
  {
    "id": 112,
    "section": "Road Traffic Signs",
    "question": "You see a No entry sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Do not enter from that direction."
  },
  {
    "id": 113,
    "section": "Road Traffic Signs",
    "question": "Which statement about a No entry sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "NO ENTRY",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Do not enter from that direction."
  },
  {
    "id": 114,
    "section": "Road Traffic Signs",
    "question": "A No entry sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Do not enter from that direction."
  },
  {
    "id": 115,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a No entry sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Do not enter from that direction."
  },
  {
    "id": 116,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a Speed-limit sign?",
    "options": [
      "SPEED LIMIT",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Do not exceed the displayed limit; drive slower if conditions require."
  },
  {
    "id": 117,
    "section": "Road Traffic Signs",
    "question": "You see a Speed-limit sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Do not exceed the displayed limit; drive slower if conditions require."
  },
  {
    "id": 118,
    "section": "Road Traffic Signs",
    "question": "Which statement about a Speed-limit sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "SPEED LIMIT",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Do not exceed the displayed limit; drive slower if conditions require."
  },
  {
    "id": 119,
    "section": "Road Traffic Signs",
    "question": "A Speed-limit sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Do not exceed the displayed limit; drive slower if conditions require."
  },
  {
    "id": 120,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a Speed-limit sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Do not exceed the displayed limit; drive slower if conditions require."
  },
  {
    "id": 121,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a No overtaking sign?",
    "options": [
      "NO OVERTAKING",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Do not overtake where the restriction applies."
  },
  {
    "id": 122,
    "section": "Road Traffic Signs",
    "question": "You see a No overtaking sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Do not overtake where the restriction applies."
  },
  {
    "id": 123,
    "section": "Road Traffic Signs",
    "question": "Which statement about a No overtaking sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "NO OVERTAKING",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Do not overtake where the restriction applies."
  },
  {
    "id": 124,
    "section": "Road Traffic Signs",
    "question": "A No overtaking sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Do not overtake where the restriction applies."
  },
  {
    "id": 125,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a No overtaking sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Do not overtake where the restriction applies."
  },
  {
    "id": 126,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a No U-turn sign?",
    "options": [
      "NO U-TURN",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Do not make a U-turn where prohibited."
  },
  {
    "id": 127,
    "section": "Road Traffic Signs",
    "question": "You see a No U-turn sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Do not make a U-turn where prohibited."
  },
  {
    "id": 128,
    "section": "Road Traffic Signs",
    "question": "Which statement about a No U-turn sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "NO U-TURN",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Do not make a U-turn where prohibited."
  },
  {
    "id": 129,
    "section": "Road Traffic Signs",
    "question": "A No U-turn sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Do not make a U-turn where prohibited."
  },
  {
    "id": 130,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a No U-turn sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Do not make a U-turn where prohibited."
  },
  {
    "id": 131,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a No right-turn sign?",
    "options": [
      "NO RIGHT TURN",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Do not turn right where the sign prohibits it."
  },
  {
    "id": 132,
    "section": "Road Traffic Signs",
    "question": "You see a No right-turn sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Do not turn right where the sign prohibits it."
  },
  {
    "id": 133,
    "section": "Road Traffic Signs",
    "question": "Which statement about a No right-turn sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "NO RIGHT TURN",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Do not turn right where the sign prohibits it."
  },
  {
    "id": 134,
    "section": "Road Traffic Signs",
    "question": "A No right-turn sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Do not turn right where the sign prohibits it."
  },
  {
    "id": 135,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a No right-turn sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Do not turn right where the sign prohibits it."
  },
  {
    "id": 136,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a No left-turn sign?",
    "options": [
      "NO LEFT TURN",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Do not turn left where the sign prohibits it."
  },
  {
    "id": 137,
    "section": "Road Traffic Signs",
    "question": "You see a No left-turn sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Do not turn left where the sign prohibits it."
  },
  {
    "id": 138,
    "section": "Road Traffic Signs",
    "question": "Which statement about a No left-turn sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "NO LEFT TURN",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Do not turn left where the sign prohibits it."
  },
  {
    "id": 139,
    "section": "Road Traffic Signs",
    "question": "A No left-turn sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Do not turn left where the sign prohibits it."
  },
  {
    "id": 140,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a No left-turn sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Do not turn left where the sign prohibits it."
  },
  {
    "id": 141,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a Pedestrian warning sign?",
    "options": [
      "PEDESTRIANS",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Expect pedestrians and be ready to slow or stop."
  },
  {
    "id": 142,
    "section": "Road Traffic Signs",
    "question": "You see a Pedestrian warning sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Expect pedestrians and be ready to slow or stop."
  },
  {
    "id": 143,
    "section": "Road Traffic Signs",
    "question": "Which statement about a Pedestrian warning sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "PEDESTRIANS",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Expect pedestrians and be ready to slow or stop."
  },
  {
    "id": 144,
    "section": "Road Traffic Signs",
    "question": "A Pedestrian warning sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Expect pedestrians and be ready to slow or stop."
  },
  {
    "id": 145,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a Pedestrian warning sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Expect pedestrians and be ready to slow or stop."
  },
  {
    "id": 146,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a Children or school warning sign?",
    "options": [
      "CHILDREN",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Reduce speed and watch carefully for children."
  },
  {
    "id": 147,
    "section": "Road Traffic Signs",
    "question": "You see a Children or school warning sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Reduce speed and watch carefully for children."
  },
  {
    "id": 148,
    "section": "Road Traffic Signs",
    "question": "Which statement about a Children or school warning sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "CHILDREN",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Reduce speed and watch carefully for children."
  },
  {
    "id": 149,
    "section": "Road Traffic Signs",
    "question": "A Children or school warning sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Reduce speed and watch carefully for children."
  },
  {
    "id": 150,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a Children or school warning sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Reduce speed and watch carefully for children."
  },
  {
    "id": 151,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a Sharp-bend warning sign?",
    "options": [
      "SHARP BEND",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Adjust speed before the bend and maintain control."
  },
  {
    "id": 152,
    "section": "Road Traffic Signs",
    "question": "You see a Sharp-bend warning sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Adjust speed before the bend and maintain control."
  },
  {
    "id": 153,
    "section": "Road Traffic Signs",
    "question": "Which statement about a Sharp-bend warning sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "SHARP BEND",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Adjust speed before the bend and maintain control."
  },
  {
    "id": 154,
    "section": "Road Traffic Signs",
    "question": "A Sharp-bend warning sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Adjust speed before the bend and maintain control."
  },
  {
    "id": 155,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a Sharp-bend warning sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Adjust speed before the bend and maintain control."
  },
  {
    "id": 156,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a Winding-road warning sign?",
    "options": [
      "WINDING ROAD",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Expect a series of bends and adjust speed."
  },
  {
    "id": 157,
    "section": "Road Traffic Signs",
    "question": "You see a Winding-road warning sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Expect a series of bends and adjust speed."
  },
  {
    "id": 158,
    "section": "Road Traffic Signs",
    "question": "Which statement about a Winding-road warning sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "WINDING ROAD",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Expect a series of bends and adjust speed."
  },
  {
    "id": 159,
    "section": "Road Traffic Signs",
    "question": "A Winding-road warning sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Expect a series of bends and adjust speed."
  },
  {
    "id": 160,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a Winding-road warning sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Expect a series of bends and adjust speed."
  },
  {
    "id": 161,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a Road-narrows warning sign?",
    "options": [
      "ROAD NARROWS",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Expect reduced road width and be prepared to give space."
  },
  {
    "id": 162,
    "section": "Road Traffic Signs",
    "question": "You see a Road-narrows warning sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Expect reduced road width and be prepared to give space."
  },
  {
    "id": 163,
    "section": "Road Traffic Signs",
    "question": "Which statement about a Road-narrows warning sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "ROAD NARROWS",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Expect reduced road width and be prepared to give space."
  },
  {
    "id": 164,
    "section": "Road Traffic Signs",
    "question": "A Road-narrows warning sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Expect reduced road width and be prepared to give space."
  },
  {
    "id": 165,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a Road-narrows warning sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Expect reduced road width and be prepared to give space."
  },
  {
    "id": 166,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a Slippery-road warning sign?",
    "options": [
      "SLIPPERY ROAD",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Reduce speed and avoid abrupt braking or steering."
  },
  {
    "id": 167,
    "section": "Road Traffic Signs",
    "question": "You see a Slippery-road warning sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Reduce speed and avoid abrupt braking or steering."
  },
  {
    "id": 168,
    "section": "Road Traffic Signs",
    "question": "Which statement about a Slippery-road warning sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "SLIPPERY ROAD",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Reduce speed and avoid abrupt braking or steering."
  },
  {
    "id": 169,
    "section": "Road Traffic Signs",
    "question": "A Slippery-road warning sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Reduce speed and avoid abrupt braking or steering."
  },
  {
    "id": 170,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a Slippery-road warning sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Reduce speed and avoid abrupt braking or steering."
  },
  {
    "id": 171,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a Roadworks warning sign?",
    "options": [
      "ROADWORKS",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Slow down and obey temporary signs and directions."
  },
  {
    "id": 172,
    "section": "Road Traffic Signs",
    "question": "You see a Roadworks warning sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Slow down and obey temporary signs and directions."
  },
  {
    "id": 173,
    "section": "Road Traffic Signs",
    "question": "Which statement about a Roadworks warning sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "ROADWORKS",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Slow down and obey temporary signs and directions."
  },
  {
    "id": 174,
    "section": "Road Traffic Signs",
    "question": "A Roadworks warning sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Slow down and obey temporary signs and directions."
  },
  {
    "id": 175,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a Roadworks warning sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Slow down and obey temporary signs and directions."
  },
  {
    "id": 176,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a Railway-crossing warning sign?",
    "options": [
      "RAILWAY CROSSING",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Approach carefully and obey crossing signals and barriers."
  },
  {
    "id": 177,
    "section": "Road Traffic Signs",
    "question": "You see a Railway-crossing warning sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Approach carefully and obey crossing signals and barriers."
  },
  {
    "id": 178,
    "section": "Road Traffic Signs",
    "question": "Which statement about a Railway-crossing warning sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "RAILWAY CROSSING",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Approach carefully and obey crossing signals and barriers."
  },
  {
    "id": 179,
    "section": "Road Traffic Signs",
    "question": "A Railway-crossing warning sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Approach carefully and obey crossing signals and barriers."
  },
  {
    "id": 180,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a Railway-crossing warning sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Approach carefully and obey crossing signals and barriers."
  },
  {
    "id": 181,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a Traffic-signals-ahead warning sign?",
    "options": [
      "TRAFFIC SIGNALS AHEAD",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Be prepared to slow and stop at the signals."
  },
  {
    "id": 182,
    "section": "Road Traffic Signs",
    "question": "You see a Traffic-signals-ahead warning sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Be prepared to slow and stop at the signals."
  },
  {
    "id": 183,
    "section": "Road Traffic Signs",
    "question": "Which statement about a Traffic-signals-ahead warning sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "TRAFFIC SIGNALS AHEAD",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Be prepared to slow and stop at the signals."
  },
  {
    "id": 184,
    "section": "Road Traffic Signs",
    "question": "A Traffic-signals-ahead warning sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Be prepared to slow and stop at the signals."
  },
  {
    "id": 185,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a Traffic-signals-ahead warning sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Be prepared to slow and stop at the signals."
  },
  {
    "id": 186,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a Roundabout warning sign?",
    "options": [
      "ROUNDABOUT",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Reduce speed, observe priority rules and choose the correct exit."
  },
  {
    "id": 187,
    "section": "Road Traffic Signs",
    "question": "You see a Roundabout warning sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Reduce speed, observe priority rules and choose the correct exit."
  },
  {
    "id": 188,
    "section": "Road Traffic Signs",
    "question": "Which statement about a Roundabout warning sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "ROUNDABOUT",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Reduce speed, observe priority rules and choose the correct exit."
  },
  {
    "id": 189,
    "section": "Road Traffic Signs",
    "question": "A Roundabout warning sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Reduce speed, observe priority rules and choose the correct exit."
  },
  {
    "id": 190,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a Roundabout warning sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Reduce speed, observe priority rules and choose the correct exit."
  },
  {
    "id": 191,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a Two-way-traffic warning sign?",
    "options": [
      "TWO-WAY TRAFFIC",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Expect traffic in both directions and keep to your side."
  },
  {
    "id": 192,
    "section": "Road Traffic Signs",
    "question": "You see a Two-way-traffic warning sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Expect traffic in both directions and keep to your side."
  },
  {
    "id": 193,
    "section": "Road Traffic Signs",
    "question": "Which statement about a Two-way-traffic warning sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "TWO-WAY TRAFFIC",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Expect traffic in both directions and keep to your side."
  },
  {
    "id": 194,
    "section": "Road Traffic Signs",
    "question": "A Two-way-traffic warning sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Expect traffic in both directions and keep to your side."
  },
  {
    "id": 195,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a Two-way-traffic warning sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Expect traffic in both directions and keep to your side."
  },
  {
    "id": 196,
    "section": "Road Traffic Signs",
    "question": "What is the main message of a Low-clearance warning sign?",
    "options": [
      "LOW CLEARANCE",
      "Parking is always permitted",
      "The road has no hazards",
      "You have priority in every situation"
    ],
    "answer": 0,
    "explanation": "Check vehicle height against the displayed clearance before proceeding."
  },
  {
    "id": 197,
    "section": "Road Traffic Signs",
    "question": "You see a Low-clearance warning sign ahead. What should you do?",
    "options": [
      "Ignore it if traffic is light",
      "Respond according to the sign and road conditions",
      "Accelerate before reaching it",
      "Follow the vehicle ahead without checking"
    ],
    "answer": 1,
    "explanation": "Check vehicle height against the displayed clearance before proceeding."
  },
  {
    "id": 198,
    "section": "Road Traffic Signs",
    "question": "Which statement about a Low-clearance warning sign is correct?",
    "options": [
      "It is only for large vehicles",
      "It can be ignored in daylight",
      "LOW CLEARANCE",
      "It cancels all other road rules"
    ],
    "answer": 2,
    "explanation": "Check vehicle height against the displayed clearance before proceeding."
  },
  {
    "id": 199,
    "section": "Road Traffic Signs",
    "question": "A Low-clearance warning sign is partly obscured. What is safest?",
    "options": [
      "Assume it does not apply",
      "Drive faster to pass it",
      "Follow another driver's choice",
      "Reduce speed, look for other clues and proceed cautiously"
    ],
    "answer": 3,
    "explanation": "Check vehicle height against the displayed clearance before proceeding."
  },
  {
    "id": 200,
    "section": "Road Traffic Signs",
    "question": "Why should you pay attention to a Low-clearance warning sign?",
    "options": [
      "It communicates a restriction, warning or instruction relevant to safe driving",
      "It guarantees the road is empty",
      "It replaces observation",
      "It gives permission to speed"
    ],
    "answer": 0,
    "explanation": "Check vehicle height against the displayed clearance before proceeding."
  },
  {
    "id": 201,
    "section": "Vehicle Controls",
    "question": "What is the steering wheel mainly used for?",
    "options": [
      "To control the vehicle's direction",
      "To operate wipers",
      "To measure fuel",
      "To change gears"
    ],
    "answer": 0,
    "explanation": "The steering wheel controls the vehicle's direction."
  },
  {
    "id": 202,
    "section": "Vehicle Controls",
    "question": "Your steering suddenly feels unusually heavy. What should you do?",
    "options": [
      "Ignore it",
      "Stop safely when possible and have the fault checked",
      "Drive faster",
      "Switch off headlights"
    ],
    "answer": 1,
    "explanation": "A sudden change in steering may indicate a fault."
  },
  {
    "id": 203,
    "section": "Vehicle Controls",
    "question": "Why keep your hands appropriately positioned on the steering wheel?",
    "options": [
      "It makes the horn louder",
      "It prevents all skids",
      "It helps maintain control and respond to hazards",
      "It inflates tyres"
    ],
    "answer": 2,
    "explanation": "Good steering control helps you respond safely."
  },
  {
    "id": 204,
    "section": "Vehicle Controls",
    "question": "What should you avoid when turning?",
    "options": [
      "Looking where you intend to go",
      "Reducing speed appropriately",
      "Maintaining control",
      "Abrupt steering that could destabilise the vehicle"
    ],
    "answer": 3,
    "explanation": "Abrupt steering can reduce control."
  },
  {
    "id": 205,
    "section": "Vehicle Controls",
    "question": "Steering has excessive free play. What might this indicate?",
    "options": [
      "A fault that should be inspected",
      "That tyres are new",
      "That fuel is low only",
      "That brakes are perfect"
    ],
    "answer": 0,
    "explanation": "Excessive steering play may indicate a safety-related fault."
  },
  {
    "id": 206,
    "section": "Vehicle Controls",
    "question": "What is the main purpose of the foot brake?",
    "options": [
      "To turn the vehicle",
      "To slow or stop the vehicle",
      "To operate indicators",
      "To cool the engine"
    ],
    "answer": 1,
    "explanation": "The foot brake slows or stops the vehicle."
  },
  {
    "id": 207,
    "section": "Vehicle Controls",
    "question": "The brake pedal feels soft or sinks unusually. What should you do?",
    "options": [
      "Drive normally",
      "Pump the accelerator",
      "Stop safely and arrange inspection; do not continue if braking is unsafe",
      "Increase speed"
    ],
    "answer": 2,
    "explanation": "An unusual brake pedal may indicate a serious brake fault."
  },
  {
    "id": 208,
    "section": "Vehicle Controls",
    "question": "Why avoid harsh braking unless needed to avoid danger?",
    "options": [
      "It improves tyre grip",
      "It guarantees no collision",
      "It saves all brake wear",
      "It can cause loss of control or a rear-end collision"
    ],
    "answer": 3,
    "explanation": "Harsh braking can destabilise the vehicle and surprise following traffic."
  },
  {
    "id": 209,
    "section": "Vehicle Controls",
    "question": "Before a long downhill stretch, what should you consider?",
    "options": [
      "Suitable speed and gear to help avoid overworking the brakes",
      "Switching the engine off",
      "Coasting in neutral",
      "Riding the brake at high speed"
    ],
    "answer": 0,
    "explanation": "Use an appropriate gear and speed on descents."
  },
  {
    "id": 210,
    "section": "Vehicle Controls",
    "question": "If the brakes fail, what should you do?",
    "options": [
      "Accelerate",
      "Stay calm, warn others if possible and use safe ways to slow and steer to safety",
      "Lock the steering",
      "Jump out immediately"
    ],
    "answer": 1,
    "explanation": "Maintain control and use safe procedures to bring the vehicle to a stop."
  },
  {
    "id": 211,
    "section": "Vehicle Controls",
    "question": "What is the parking brake mainly for?",
    "options": [
      "Increasing speed",
      "Changing lanes",
      "Helping keep a parked vehicle stationary",
      "Operating the horn"
    ],
    "answer": 2,
    "explanation": "The parking brake helps prevent a parked vehicle from rolling."
  },
  {
    "id": 212,
    "section": "Vehicle Controls",
    "question": "Before driving away, what should you check about the parking brake?",
    "options": [
      "It is fully applied",
      "The tyres are removed",
      "The lights are off",
      "It is released as appropriate and the vehicle is safe to move"
    ],
    "answer": 3,
    "explanation": "Ensure the parking brake is released as appropriate before moving."
  },
  {
    "id": 213,
    "section": "Vehicle Controls",
    "question": "Why use the parking brake when parked?",
    "options": [
      "To help prevent the vehicle from rolling",
      "To increase engine power",
      "To replace maintenance",
      "To keep indicators flashing"
    ],
    "answer": 0,
    "explanation": "The parking brake helps secure the vehicle."
  },
  {
    "id": 214,
    "section": "Vehicle Controls",
    "question": "The parking brake does not hold on a slope. What should you do?",
    "options": [
      "Leave it anyway",
      "Secure the vehicle safely and have the fault repaired",
      "Park in neutral only",
      "Ask someone to stand behind it"
    ],
    "answer": 1,
    "explanation": "Do not rely on a defective parking brake."
  },
  {
    "id": 215,
    "section": "Vehicle Controls",
    "question": "What should you do when parking an automatic vehicle?",
    "options": [
      "Leave it in drive",
      "Rely on the accelerator",
      "Select Park as appropriate and apply the parking brake as advised",
      "Turn the wheel rapidly"
    ],
    "answer": 2,
    "explanation": "Follow the vehicle's instructions for securing an automatic vehicle."
  },
  {
    "id": 216,
    "section": "Vehicle Controls",
    "question": "What does the clutch pedal help a manual driver do?",
    "options": [
      "Operate wipers",
      "Control headlights",
      "Measure speed",
      "Connect or disconnect engine drive to change gear"
    ],
    "answer": 3,
    "explanation": "The clutch temporarily disconnects engine drive from the transmission."
  },
  {
    "id": 217,
    "section": "Vehicle Controls",
    "question": "When is the clutch normally used in a manual car?",
    "options": [
      "When changing gears as appropriate",
      "Every time you indicate",
      "To increase tyre pressure",
      "Only when parked for days"
    ],
    "answer": 0,
    "explanation": "The clutch is used for gear changes and controlled starts/stops."
  },
  {
    "id": 218,
    "section": "Vehicle Controls",
    "question": "What can riding the clutch cause?",
    "options": [
      "Better braking",
      "Unnecessary clutch wear and overheating",
      "More fuel in the tank",
      "Improved tread"
    ],
    "answer": 1,
    "explanation": "Keeping the clutch partially engaged can cause wear and heat."
  },
  {
    "id": 219,
    "section": "Vehicle Controls",
    "question": "What is the biting point?",
    "options": [
      "Where headlights turn on",
      "Where the brake pedal stops",
      "Where the clutch begins to transmit drive",
      "A tyre-pressure reading"
    ],
    "answer": 2,
    "explanation": "At the biting point, the clutch begins transmitting engine drive."
  },
  {
    "id": 220,
    "section": "Vehicle Controls",
    "question": "What is important when starting on a hill in a manual car?",
    "options": [
      "Release every control at once",
      "Use maximum acceleration always",
      "Look only at the gear lever",
      "Coordinate clutch, accelerator and brake smoothly to prevent rolling"
    ],
    "answer": 3,
    "explanation": "Smooth coordination helps prevent rollback and loss of control."
  },
  {
    "id": 221,
    "section": "Vehicle Controls",
    "question": "What does the accelerator pedal control?",
    "options": [
      "Engine power and acceleration",
      "Parking lights only",
      "Tyre pressure",
      "Windscreen washer"
    ],
    "answer": 0,
    "explanation": "The accelerator controls engine power and acceleration."
  },
  {
    "id": 222,
    "section": "Vehicle Controls",
    "question": "Why use smooth accelerator inputs on a slippery road?",
    "options": [
      "To make the horn work",
      "To reduce wheelspin and loss-of-control risk",
      "To shorten every journey",
      "To turn off ABS"
    ],
    "answer": 1,
    "explanation": "Abrupt acceleration can cause loss of traction."
  },
  {
    "id": 223,
    "section": "Vehicle Controls",
    "question": "Engine speed rises but the vehicle does not accelerate normally. What could this suggest?",
    "options": [
      "Indicators are on",
      "Windscreen is dirty",
      "A clutch or drivetrain problem requiring inspection",
      "Seat belt is loose"
    ],
    "answer": 2,
    "explanation": "Unusual engine revving without normal acceleration may indicate a mechanical fault."
  },
  {
    "id": 224,
    "section": "Vehicle Controls",
    "question": "When approaching a hazard, what should you do with the accelerator?",
    "options": [
      "Accelerate without looking",
      "Keep accelerating through every hazard",
      "Use it to distract pedestrians",
      "Ease off as needed and prepare to brake safely"
    ],
    "answer": 3,
    "explanation": "Adjust speed early and remain ready to stop."
  },
  {
    "id": 225,
    "section": "Vehicle Controls",
    "question": "Why can sudden acceleration on a bend be risky?",
    "options": [
      "It can affect tyre grip and vehicle stability",
      "It makes the road wider",
      "It guarantees traction",
      "It replaces steering"
    ],
    "answer": 0,
    "explanation": "Sudden acceleration can affect grip and stability."
  },
  {
    "id": 226,
    "section": "Vehicle Controls",
    "question": "Why select an appropriate gear before a steep climb?",
    "options": [
      "To use the horn",
      "To maintain suitable power and control",
      "To make mirrors clearer",
      "To turn off brakes"
    ],
    "answer": 1,
    "explanation": "The correct gear helps maintain power and control."
  },
  {
    "id": 227,
    "section": "Vehicle Controls",
    "question": "Why avoid coasting downhill in neutral?",
    "options": [
      "It always saves fuel",
      "It improves steering",
      "It reduces driver control and engine braking",
      "It guarantees a shorter stop"
    ],
    "answer": 2,
    "explanation": "Coasting in neutral reduces control and engine braking."
  },
  {
    "id": 228,
    "section": "Vehicle Controls",
    "question": "You select the wrong gear while moving. What should you do?",
    "options": [
      "Panic",
      "Accelerate fully",
      "Turn off lights",
      "Stay calm and select a suitable gear safely"
    ],
    "answer": 3,
    "explanation": "Correct the gear choice smoothly while maintaining control."
  },
  {
    "id": 229,
    "section": "Vehicle Controls",
    "question": "What is reverse gear used for?",
    "options": [
      "Moving the vehicle backwards when safe",
      "Increasing forward speed",
      "Applying the parking brake",
      "Starting the radio"
    ],
    "answer": 0,
    "explanation": "Reverse gear moves the vehicle backwards."
  },
  {
    "id": 230,
    "section": "Vehicle Controls",
    "question": "Before reversing, what should you do?",
    "options": [
      "Reverse immediately",
      "Check all around and ensure the path is clear",
      "Rely only on a camera",
      "Hoot and move"
    ],
    "answer": 1,
    "explanation": "Check the area around the vehicle; cameras do not show every hazard."
  },
  {
    "id": 231,
    "section": "Vehicle Controls",
    "question": "What is the main use of the rear-view mirror?",
    "options": [
      "Checking engine oil",
      "Checking tyre pressure",
      "Observing traffic behind",
      "Seeing under the bonnet"
    ],
    "answer": 2,
    "explanation": "The rear-view mirror helps you observe traffic behind."
  },
  {
    "id": 232,
    "section": "Vehicle Controls",
    "question": "When should you check mirrors?",
    "options": [
      "Only after parking",
      "Only when asked",
      "Never in traffic",
      "Regularly and before manoeuvres"
    ],
    "answer": 3,
    "explanation": "Regular mirror checks support awareness of surrounding traffic."
  },
  {
    "id": 233,
    "section": "Vehicle Controls",
    "question": "Why adjust mirrors before moving off?",
    "options": [
      "To get the best available view around the vehicle",
      "To make the vehicle faster",
      "To replace indicators",
      "To eliminate every blind spot"
    ],
    "answer": 0,
    "explanation": "Correctly adjusted mirrors improve visibility."
  },
  {
    "id": 234,
    "section": "Vehicle Controls",
    "question": "A mirror is cracked or badly misaligned. What should you do?",
    "options": [
      "Ignore it",
      "Correct or repair it before driving where needed for safe/legal operation",
      "Cover all mirrors",
      "Use a phone instead"
    ],
    "answer": 1,
    "explanation": "Mirrors should provide a useful view and be safe for use."
  },
  {
    "id": 235,
    "section": "Vehicle Controls",
    "question": "Do mirrors show every area beside your vehicle?",
    "options": [
      "Yes, always",
      "Only at night",
      "No, blind spots can remain",
      "Only on motorways"
    ],
    "answer": 2,
    "explanation": "Mirrors cannot show every area around a vehicle."
  },
  {
    "id": 236,
    "section": "Vehicle Controls",
    "question": "What is a blind spot?",
    "options": [
      "A dirty windscreen",
      "A dashboard warning",
      "A tyre defect",
      "An area not adequately visible in mirrors"
    ],
    "answer": 3,
    "explanation": "Blind spots are areas not adequately visible in mirrors."
  },
  {
    "id": 237,
    "section": "Vehicle Controls",
    "question": "When should you check a blind spot?",
    "options": [
      "Before moving sideways or merging when safe",
      "Only after manoeuvring",
      "Only while parked at home",
      "Only with the engine off"
    ],
    "answer": 0,
    "explanation": "Check blind spots before lateral movement."
  },
  {
    "id": 238,
    "section": "Vehicle Controls",
    "question": "Why is a shoulder check useful?",
    "options": [
      "It changes the speed limit",
      "It can reveal road users hidden from mirrors",
      "It tests brakes",
      "It replaces signalling"
    ],
    "answer": 1,
    "explanation": "A shoulder check helps detect road users in blind spots."
  },
  {
    "id": 239,
    "section": "Vehicle Controls",
    "question": "You see no vehicle in your mirror before changing lanes. What next?",
    "options": [
      "Move immediately",
      "Accelerate into the lane",
      "Check the blind spot and ensure the manoeuvre is safe",
      "Close your eyes"
    ],
    "answer": 2,
    "explanation": "Mirror checks should be supplemented with blind-spot checks."
  },
  {
    "id": 240,
    "section": "Vehicle Controls",
    "question": "Who might be hidden in a blind spot?",
    "options": [
      "Only buses",
      "Only pedestrians",
      "Only parked cars",
      "Motorcycles, cyclists or other vehicles"
    ],
    "answer": 3,
    "explanation": "Different road users can be hidden from mirrors."
  },
  {
    "id": 241,
    "section": "Vehicle Controls",
    "question": "What is the purpose of a turn indicator?",
    "options": [
      "To communicate your intended direction",
      "To show fuel level",
      "To stop the engine",
      "To measure distance"
    ],
    "answer": 0,
    "explanation": "Indicators communicate an intended turn or lane change."
  },
  {
    "id": 242,
    "section": "Vehicle Controls",
    "question": "An indicator flashes unusually fast. What may this suggest?",
    "options": [
      "The car is speeding",
      "A bulb or indicator circuit may have a fault",
      "The brakes are new",
      "Tyres are overinflated"
    ],
    "answer": 1,
    "explanation": "An abnormal flash rate can indicate an indicator fault."
  },
  {
    "id": 243,
    "section": "Vehicle Controls",
    "question": "When should you cancel an indicator?",
    "options": [
      "Before every manoeuvre",
      "Never",
      "After completing the manoeuvre when appropriate",
      "Only at night"
    ],
    "answer": 2,
    "explanation": "Cancel the signal when the manoeuvre is complete."
  },
  {
    "id": 244,
    "section": "Vehicle Controls",
    "question": "Does an indicator guarantee that a lane change is safe?",
    "options": [
      "Yes",
      "Only on dry roads",
      "Only if you hoot",
      "No, you must still check and give way as required"
    ],
    "answer": 3,
    "explanation": "Signalling does not grant priority."
  },
  {
    "id": 245,
    "section": "Vehicle Controls",
    "question": "Your indicator fails before a turn. What should you do?",
    "options": [
      "Avoid an unsafe manoeuvre, use a lawful alternative if appropriate and repair the fault",
      "Turn without checking",
      "Use hazard lights in every case",
      "Accelerate"
    ],
    "answer": 0,
    "explanation": "Do not make an unsafe manoeuvre because an indicator has failed."
  },
  {
    "id": 246,
    "section": "Vehicle Controls",
    "question": "What is the main purpose of headlights?",
    "options": [
      "Cooling the engine",
      "Helping illuminate the road and making the vehicle visible",
      "Steering",
      "Checking oil"
    ],
    "answer": 1,
    "explanation": "Headlights help drivers see and be seen."
  },
  {
    "id": 247,
    "section": "Vehicle Controls",
    "question": "A headlight fails at night. What should you do?",
    "options": [
      "Drive faster",
      "Use only dashboard lights",
      "Avoid unsafe driving and repair the fault promptly",
      "Ignore it"
    ],
    "answer": 2,
    "explanation": "Faulty lights can compromise visibility and safety."
  },
  {
    "id": 248,
    "section": "Vehicle Controls",
    "question": "Why dip high beams for oncoming traffic when required?",
    "options": [
      "To increase glare",
      "To improve the other driver's speed",
      "To darken your windscreen",
      "To avoid dazzling other drivers"
    ],
    "answer": 3,
    "explanation": "Avoid dazzling other road users."
  },
  {
    "id": 249,
    "section": "Vehicle Controls",
    "question": "What can badly aimed headlights do?",
    "options": [
      "Dazzle others or fail to illuminate the road properly",
      "Improve braking",
      "Increase tyre grip",
      "Replace indicators"
    ],
    "answer": 0,
    "explanation": "Headlights should be correctly aimed and working."
  },
  {
    "id": 250,
    "section": "Vehicle Controls",
    "question": "Before a night journey, what should you check?",
    "options": [
      "Only the radio",
      "Lights, windscreen, mirrors and general vehicle condition",
      "Only the seat colour",
      "Only the horn"
    ],
    "answer": 1,
    "explanation": "A pre-trip check helps identify faults affecting safety."
  },
  {
    "id": 251,
    "section": "Vehicle Controls",
    "question": "What are windscreen wipers designed to do?",
    "options": [
      "Change gears",
      "Cool brakes",
      "Clear rain and improve visibility",
      "Measure distance"
    ],
    "answer": 2,
    "explanation": "Wipers clear rain and debris from the windscreen."
  },
  {
    "id": 252,
    "section": "Vehicle Controls",
    "question": "Wipers smear water instead of clearing it. What should you do?",
    "options": [
      "Drive faster",
      "Ignore the windscreen",
      "Turn off headlights",
      "Clean or replace blades as needed"
    ],
    "answer": 3,
    "explanation": "Effective wipers are essential for visibility."
  },
  {
    "id": 253,
    "section": "Vehicle Controls",
    "question": "Why check washer fluid before a journey?",
    "options": [
      "It helps remove dirt from the windscreen",
      "It inflates tyres",
      "It cools the gearbox",
      "It adjusts mirrors"
    ],
    "answer": 0,
    "explanation": "Washer fluid helps clean the windscreen."
  },
  {
    "id": 254,
    "section": "Vehicle Controls",
    "question": "Heavy rain starts and wipers cannot clear the screen. What should you do?",
    "options": [
      "Continue at speed",
      "Slow down and stop safely if visibility is inadequate",
      "Look through a side window only",
      "Use the horn"
    ],
    "answer": 1,
    "explanation": "Do not continue if visibility is inadequate for safe driving."
  },
  {
    "id": 255,
    "section": "Vehicle Controls",
    "question": "Why keep the windscreen clean?",
    "options": [
      "It improves engine power",
      "It reduces braking distance",
      "Dirt and glare can reduce visibility",
      "It makes seat belts unnecessary"
    ],
    "answer": 2,
    "explanation": "A clean windscreen improves visibility."
  },
  {
    "id": 256,
    "section": "Vehicle Controls",
    "question": "Why check tyre pressure regularly?",
    "options": [
      "It changes road signs",
      "It makes the horn louder",
      "It replaces alignment",
      "Correct pressure supports safe handling and tyre life"
    ],
    "answer": 3,
    "explanation": "Correct tyre pressure affects handling, braking and tyre wear."
  },
  {
    "id": 257,
    "section": "Vehicle Controls",
    "question": "A tyre has a visible bulge or serious damage. What should you do?",
    "options": [
      "Have it checked and replaced before driving if unsafe",
      "Drive faster",
      "Deflate the other tyres",
      "Ignore it"
    ],
    "answer": 0,
    "explanation": "Visible tyre damage may indicate a dangerous structural fault."
  },
  {
    "id": 258,
    "section": "Vehicle Controls",
    "question": "Why is worn tread dangerous in rain?",
    "options": [
      "It improves water drainage",
      "It reduces grip and increases aquaplaning risk",
      "It makes stopping easier",
      "It changes the speed limit"
    ],
    "answer": 1,
    "explanation": "Tread helps disperse water and maintain grip."
  },
  {
    "id": 259,
    "section": "Vehicle Controls",
    "question": "When should tyre pressure normally be checked for a reliable reading?",
    "options": [
      "Only while driving",
      "After a tyre bursts",
      "According to the manual, typically when tyres are cold",
      "Only when visibly flat"
    ],
    "answer": 2,
    "explanation": "Follow the vehicle manufacturer's tyre-pressure guidance."
  },
  {
    "id": 260,
    "section": "Vehicle Controls",
    "question": "A tyre bursts while moving. What is safer?",
    "options": [
      "Brake as hard as possible immediately",
      "Turn sharply onto the shoulder",
      "Accelerate hard",
      "Hold the steering firmly and slow gradually while maintaining control"
    ],
    "answer": 3,
    "explanation": "Avoid sudden steering or braking and reduce speed gradually."
  },
  {
    "id": 261,
    "section": "Vehicle Controls",
    "question": "What may an engine-temperature warning indicate?",
    "options": [
      "The engine may be overheating",
      "Tyre pressure is perfect",
      "The fuel tank is full",
      "Indicators work"
    ],
    "answer": 0,
    "explanation": "A temperature warning may indicate overheating."
  },
  {
    "id": 262,
    "section": "Vehicle Controls",
    "question": "If the engine overheats, what should you do?",
    "options": [
      "Open the radiator cap while hot",
      "Stop safely, switch off as appropriate and let it cool",
      "Pour cold water on the hot engine indiscriminately",
      "Continue at high speed"
    ],
    "answer": 1,
    "explanation": "Stop safely and allow the engine to cool before checks."
  },
  {
    "id": 263,
    "section": "Vehicle Controls",
    "question": "Why not open a hot pressurised radiator cap?",
    "options": [
      "It improves cooling",
      "It reduces tyre wear",
      "Hot coolant or steam can cause serious burns",
      "It starts the engine faster"
    ],
    "answer": 2,
    "explanation": "Hot pressurised coolant can cause severe burns."
  },
  {
    "id": 264,
    "section": "Vehicle Controls",
    "question": "What can a coolant leak cause?",
    "options": [
      "Better performance",
      "Lower fuel use always",
      "Stronger brakes",
      "Overheating and engine damage"
    ],
    "answer": 3,
    "explanation": "A coolant leak can lead to overheating."
  },
  {
    "id": 265,
    "section": "Vehicle Controls",
    "question": "Before a long trip, how should coolant be checked?",
    "options": [
      "Follow the manual and check only when safe and cool",
      "Open the hot cap",
      "Ignore warning lights",
      "Fill with any chemical"
    ],
    "answer": 0,
    "explanation": "Follow the manufacturer's safe checking procedure."
  },
  {
    "id": 266,
    "section": "Vehicle Controls",
    "question": "What is the purpose of engine oil?",
    "options": [
      "Cleaning the windscreen",
      "Lubricating engine components and reducing wear",
      "Inflating tyres",
      "Operating indicators"
    ],
    "answer": 1,
    "explanation": "Engine oil lubricates moving parts."
  },
  {
    "id": 267,
    "section": "Vehicle Controls",
    "question": "An oil-pressure warning appears while driving. What should you do?",
    "options": [
      "Ignore it",
      "Accelerate to clear it",
      "Stop safely as soon as possible and investigate",
      "Switch on the radio"
    ],
    "answer": 2,
    "explanation": "Low oil pressure can cause serious engine damage."
  },
  {
    "id": 268,
    "section": "Vehicle Controls",
    "question": "Why should dashboard warning lights not be ignored?",
    "options": [
      "They are decorations",
      "They always turn off permanently",
      "They replace servicing",
      "They may indicate a fault affecting safety or the engine"
    ],
    "answer": 3,
    "explanation": "Warning lights can signal faults that need attention."
  },
  {
    "id": 269,
    "section": "Vehicle Controls",
    "question": "When should you check engine oil?",
    "options": [
      "As the manual directs, with the vehicle safely parked",
      "Only while driving",
      "By opening a hot radiator cap",
      "Never"
    ],
    "answer": 0,
    "explanation": "Follow the manufacturer's procedure for checking oil."
  },
  {
    "id": 270,
    "section": "Vehicle Controls",
    "question": "A warning light remains on after starting. What should you do?",
    "options": [
      "Cover it with tape",
      "Check the manual and take action appropriate to the warning",
      "Drive faster",
      "Disconnect every fuse"
    ],
    "answer": 1,
    "explanation": "Persistent warning lights should be investigated."
  },
  {
    "id": 271,
    "section": "Vehicle Controls",
    "question": "What may a weak battery cause?",
    "options": [
      "Sharper steering",
      "Better tyre grip",
      "Slow cranking or difficulty starting",
      "Shorter braking distance"
    ],
    "answer": 2,
    "explanation": "A weak battery can make starting difficult."
  },
  {
    "id": 272,
    "section": "Vehicle Controls",
    "question": "A battery warning light appears while driving. What should you do?",
    "options": [
      "Ignore it",
      "Accelerate to charge it instantly",
      "Remove the battery while moving",
      "Follow the vehicle manual and seek a safe inspection"
    ],
    "answer": 3,
    "explanation": "A charging-system warning should be investigated safely."
  },
  {
    "id": 273,
    "section": "Vehicle Controls",
    "question": "Why keep battery terminals in good condition?",
    "options": [
      "Poor connections can cause starting or charging problems",
      "They control traffic lights",
      "They inflate tyres",
      "They replace the alternator"
    ],
    "answer": 0,
    "explanation": "Clean, secure terminals support reliable electrical connections."
  },
  {
    "id": 274,
    "section": "Vehicle Controls",
    "question": "Before jump-starting a vehicle, what should you do?",
    "options": [
      "Connect cables randomly",
      "Follow the manufacturer's procedure and safety precautions",
      "Touch terminals together",
      "Smoke beside the battery"
    ],
    "answer": 1,
    "explanation": "Incorrect jump-starting can cause injury or vehicle damage."
  },
  {
    "id": 275,
    "section": "Vehicle Controls",
    "question": "Why can a vehicle battery be hazardous?",
    "options": [
      "It contains no energy",
      "It cannot leak",
      "It can supply high current and may contain corrosive electrolyte",
      "It improves steering"
    ],
    "answer": 2,
    "explanation": "Batteries can present electrical and chemical hazards."
  },
  {
    "id": 276,
    "section": "Vehicle Controls",
    "question": "What should you do before moving the vehicle?",
    "options": [
      "Ask passengers to hold the dashboard",
      "Drive slowly without belts",
      "Use belts only on highways",
      "Ensure required seat belts and child restraints are fastened"
    ],
    "answer": 3,
    "explanation": "Use restraints as required before moving."
  },
  {
    "id": 277,
    "section": "Vehicle Controls",
    "question": "How should a seat belt normally fit?",
    "options": [
      "Snugly across the pelvis and chest as designed",
      "Across the neck",
      "Behind the back",
      "Under the arm"
    ],
    "answer": 0,
    "explanation": "Correct belt positioning improves protection."
  },
  {
    "id": 278,
    "section": "Vehicle Controls",
    "question": "A seat belt is frayed or its buckle fails. What should you do?",
    "options": [
      "Tie it in a knot",
      "Have it repaired or replaced before relying on it",
      "Ignore it",
      "Use it only on short trips"
    ],
    "answer": 1,
    "explanation": "A damaged restraint may not protect you properly."
  },
  {
    "id": 279,
    "section": "Vehicle Controls",
    "question": "Why are child restraints important?",
    "options": [
      "They make the car faster",
      "They replace supervision",
      "They protect children when suitable and correctly installed",
      "They are needed only on gravel"
    ],
    "answer": 2,
    "explanation": "Use an appropriate restraint correctly fitted for the child."
  },
  {
    "id": 280,
    "section": "Vehicle Controls",
    "question": "Can an airbag replace a seat belt?",
    "options": [
      "Yes, in every vehicle",
      "Only for rear passengers",
      "Only in town",
      "No, airbags are supplemental and do not replace seat belts"
    ],
    "answer": 3,
    "explanation": "Airbags are designed to work with, not replace, seat belts."
  },
  {
    "id": 281,
    "section": "Vehicle Controls",
    "question": "Before opening a door into traffic, what should you do?",
    "options": [
      "Check mirrors and surroundings for approaching road users",
      "Open it quickly",
      "Hoot first",
      "Look only inside"
    ],
    "answer": 0,
    "explanation": "Check for cyclists and other road users before opening a door."
  },
  {
    "id": 282,
    "section": "Vehicle Controls",
    "question": "Why keep windows and mirrors clean?",
    "options": [
      "It increases engine power",
      "It helps maintain visibility around the vehicle",
      "It makes brakes unnecessary",
      "It reduces speed limits"
    ],
    "answer": 1,
    "explanation": "Clean glass and mirrors improve visibility."
  },
  {
    "id": 283,
    "section": "Vehicle Controls",
    "question": "A door does not latch securely. What should you do?",
    "options": [
      "Drive faster",
      "Ask a passenger to hold it",
      "Have it repaired before using the vehicle if unsafe",
      "Ignore it"
    ],
    "answer": 2,
    "explanation": "A door that cannot close securely can be dangerous."
  },
  {
    "id": 284,
    "section": "Vehicle Controls",
    "question": "Why avoid objects that block the windscreen view?",
    "options": [
      "They improve visibility",
      "They reduce tyre wear",
      "They make mirrors unnecessary",
      "They can obstruct the view of hazards"
    ],
    "answer": 3,
    "explanation": "Keep the driver's view clear."
  },
  {
    "id": 285,
    "section": "Vehicle Controls",
    "question": "A window fogs up and limits your view. What should you do?",
    "options": [
      "Use suitable demisting and wait until visibility is adequate",
      "Drive by memory",
      "Accelerate",
      "Turn off all ventilation"
    ],
    "answer": 0,
    "explanation": "Do not continue until you can see adequately."
  },
  {
    "id": 286,
    "section": "Vehicle Controls",
    "question": "Your vehicle breaks down in moving traffic. What is the priority?",
    "options": [
      "Repair it in the lane immediately",
      "Get to a safe location if possible and warn others",
      "Stand behind it in traffic",
      "Leave it without warning"
    ],
    "answer": 1,
    "explanation": "Move to safety if possible and warn other road users."
  },
  {
    "id": 287,
    "section": "Vehicle Controls",
    "question": "Why carry and know how to use appropriate emergency equipment where required?",
    "options": [
      "It guarantees no breakdown",
      "It replaces maintenance",
      "It can help warn others or respond safely to an incident",
      "It permits illegal parking"
    ],
    "answer": 2,
    "explanation": "Appropriate equipment can help manage a breakdown safely."
  },
  {
    "id": 288,
    "section": "Vehicle Controls",
    "question": "After a collision, what should you prioritise?",
    "options": [
      "Leave immediately in every case",
      "Argue with the other driver",
      "Move everyone without assessing danger",
      "Protect life, make the scene safer where possible and call for help as needed"
    ],
    "answer": 3,
    "explanation": "Protect people and summon assistance when needed."
  },
  {
    "id": 289,
    "section": "Vehicle Controls",
    "question": "If you must leave a broken-down vehicle, where should you wait?",
    "options": [
      "In a safe place away from moving traffic",
      "In the middle of the lane",
      "Behind the exhaust",
      "On railway tracks"
    ],
    "answer": 0,
    "explanation": "Wait away from traffic where it is safe to do so."
  },
  {
    "id": 290,
    "section": "Vehicle Controls",
    "question": "Why is regular vehicle maintenance important?",
    "options": [
      "It means you never need to watch the road",
      "It helps identify faults before they become dangerous",
      "It replaces legal requirements",
      "It makes speeding safe"
    ],
    "answer": 1,
    "explanation": "Maintenance helps identify faults before they compromise safety."
  },
  {
    "id": 291,
    "section": "Vehicle Controls",
    "question": "What does the speedometer indicate?",
    "options": [
      "Engine oil level",
      "Tyre tread",
      "Vehicle speed",
      "Fuel quality"
    ],
    "answer": 2,
    "explanation": "The speedometer indicates vehicle speed."
  },
  {
    "id": 292,
    "section": "Vehicle Controls",
    "question": "What does the fuel gauge help you monitor?",
    "options": [
      "Brake wear",
      "Tyre temperature",
      "Road priority",
      "Approximate fuel remaining"
    ],
    "answer": 3,
    "explanation": "The fuel gauge indicates approximate fuel remaining."
  },
  {
    "id": 293,
    "section": "Vehicle Controls",
    "question": "Why learn the meaning of warning symbols?",
    "options": [
      "To respond correctly when a fault or unsafe condition is indicated",
      "To decorate the dashboard",
      "To replace mirrors",
      "To avoid seat belts"
    ],
    "answer": 0,
    "explanation": "Knowing warning symbols helps you respond appropriately."
  },
  {
    "id": 294,
    "section": "Vehicle Controls",
    "question": "A dashboard warning appears while driving. What should you do?",
    "options": [
      "Cover it",
      "Assess the warning and stop safely if required",
      "Accelerate",
      "Ignore every warning"
    ],
    "answer": 1,
    "explanation": "Respond according to the warning and vehicle manual."
  },
  {
    "id": 295,
    "section": "Vehicle Controls",
    "question": "Why should instrument checks not distract you for long?",
    "options": [
      "They improve visibility",
      "They stop other vehicles",
      "Looking away from the road too long can cause missed hazards",
      "They replace mirrors"
    ],
    "answer": 2,
    "explanation": "Keep attention primarily on the road."
  },
  {
    "id": 296,
    "section": "Vehicle Controls",
    "question": "How should luggage be carried?",
    "options": [
      "Loose on the driver's lap",
      "Stacked to block the rear window",
      "Unsecured on the roof",
      "Secured so it cannot shift or obstruct control and visibility"
    ],
    "answer": 3,
    "explanation": "Secure loads and keep the driver's view clear."
  },
  {
    "id": 297,
    "section": "Vehicle Controls",
    "question": "Why is overloading dangerous?",
    "options": [
      "It can affect braking, handling, tyres and stability",
      "It always improves handling",
      "It reduces stopping distance",
      "It makes belts unnecessary"
    ],
    "answer": 0,
    "explanation": "Excessive load can compromise safe vehicle operation."
  },
  {
    "id": 298,
    "section": "Vehicle Controls",
    "question": "Before carrying a roof load, what should you check?",
    "options": [
      "Only the rack colour",
      "Vehicle and rack load limits and secure attachment",
      "Whether it blocks headlights",
      "Nothing if the trip is short"
    ],
    "answer": 1,
    "explanation": "Follow the vehicle and roof-rack load limits."
  },
  {
    "id": 299,
    "section": "Vehicle Controls",
    "question": "A load extends beyond the vehicle. What should you do?",
    "options": [
      "Ignore it",
      "Drive at high speed",
      "Comply with applicable rules, secure it and use required warnings",
      "Let it drag on the road"
    ],
    "answer": 2,
    "explanation": "Loads must be secured and marked as required."
  },
  {
    "id": 300,
    "section": "Vehicle Controls",
    "question": "Why must luggage not obstruct the driver's view?",
    "options": [
      "It increases power",
      "It reduces tyre wear",
      "It improves fuel economy",
      "The driver needs clear visibility to observe hazards"
    ],
    "answer": 3,
    "explanation": "A clear view is essential for safe driving."
  }
];
