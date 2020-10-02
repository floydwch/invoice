module Types
  class LineItemType < Types::BaseObject
    field :id, Int, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    field :name, String, null: true
    field :booked_amount, Float, null: true
    field :actual_amount, Float, null: true
    field :adjustments, Float, null: true
    field :campaign, Types::CampaignType, null: true
  end

  class LineItemEdgeType < GraphQL::Types::Relay::BaseEdge
    node_type(LineItemType)
  end

  class LineItemConnectionType < GraphQL::Types::Relay::BaseConnection
    edge_type(LineItemEdgeType)

    field :total, Float, null: false
    def total
      object.items.sum('actual_amount + adjustments')
    end
  end
end
