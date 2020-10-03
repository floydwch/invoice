module Types
  class LineItemType < Types::BaseObject
    field :id, Int, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    field :name, String, null: false
    field :booked_amount, Float, null: false
    field :actual_amount, Float, null: false
    field :adjustments, Float, null: false
    field :campaign, Types::CampaignType, null: false
    field :reviewed, Boolean, null: false
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
